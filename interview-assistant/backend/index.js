// Load environment variables first
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const sequelize = require('./config/database')
const User = require('./models/User')
const Discussion = require('./models/Discussion')
const Message = require('./models/Message')
const Plan = require('./models/Plan')
const Subscription = require('./models/Subscription')
const { Op } = require('sequelize')
const Meeting = require('./models/Meeting')
const paymentRoutes = require('./routes/payment')
const adminRoutes = require('./routes/adminRoutes')
// Import models index to establish associations
require('./models/index')

// Make Stripe optional
let stripe = null;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
} catch (error) {
  console.log('Stripe integration is not configured');
}

const app = express()

// ✅ Sécurité : assure que JWT_SECRET est défini ou utilise une valeur par défaut
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET non défini dans .env - using default secret (not secure for production)')
  process.env.JWT_SECRET = 'default-jwt-secret-change-in-production'
}

// ✅ CORS : autorise les requêtes du frontend
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000', // Frontend development server
      'http://localhost:3001', // Frontend development server (alternative port)
      'https://interviafrontend.vercel.app', // Production frontend
      'https://interviafrontend.vercel.app/', // Production frontend with trailing slash
      'https://zooming-enjoyment.vercel.app', // Alternative production frontend
      'https://fa10-165-51-104-50.ngrok-free.app',
      'https://hong-edmonton-tolerance-negotiations.trycloudflare.com',
      'https://speaker-weekends-pete-retrieve.trycloudflare.com',
      'https://sends-processor-preview-net.trycloudflare.com'
    ];
    
    // Add environment variable origins if provided
    if (process.env.CORS_ORIGINS) {
      const envOrigins = process.env.CORS_ORIGINS.split(',').map(origin => origin.trim());
      allowedOrigins.push(...envOrigins);
    }
    
    console.log('🌐 Request origin:', origin);
    console.log('✅ Allowed origins:', allowedOrigins);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('🚫 CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

app.use(express.json())

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Interv-ia API is running',
    version: '1.0.0',
    status: 'active'
  })
})

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    try {
      await sequelize.authenticate()
      console.log('✅ Database connection established successfully')

      // Sync database schema
      console.log('🔄 Syncing database schema...')
      await sequelize.sync({ force: false })
      console.log('✅ Database schema synchronized')

      // Check if CV columns exist using MySQL-compatible approach
      try {
        const [results] = await sequelize.query(`
          DESCRIBE Discussions
        `)
        
        const existingColumns = results.map(row => row.Field)
        const requiredColumns = ['cv_skills', 'cv_experience', 'cv_education', 'cv_summary']
        const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col))
        
        console.log('📊 Existing columns in Discussions table:', existingColumns)
        console.log('📊 Missing CV columns:', missingColumns)

        // If any CV columns are missing, add them
        if (missingColumns.length > 0) {
          console.log('⚠️ Some CV columns are missing, adding them...')
          for (const column of missingColumns) {
            await sequelize.query(`
              ALTER TABLE Discussions ADD COLUMN ${column} TEXT DEFAULT '[]'
            `)
          }
          console.log('✅ CV columns added successfully')
        }
      } catch (error) {
        console.log('⚠️ Could not check CV columns, continuing...', error.message)
      }

      // Create test user if it doesn't exist
      try {
        const testUser = await User.findOne({ where: { email: 'test@example.com' } })
        if (!testUser) {
          await User.create({
            email: 'test@example.com',
            password: await bcrypt.hash('password123', 10),
            firstName: 'Test',
            lastName: 'User'
          })
          console.log('✅ Test user created')
        }
      } catch (error) {
        console.log('⚠️ Could not create test user, continuing...', error.message)
      }
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError.message)
      console.log('⚠️ Server will start without database functionality')
      console.log('💡 Set up database environment variables for full functionality')
    }

    // Start server regardless of database status
    const PORT = process.env.PORT || 5050
    console.log(`🔧 Environment PORT: ${process.env.PORT}`)
    console.log(`🔧 Using PORT: ${PORT}`)
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`🌐 API available at: http://localhost:${PORT}`)
      console.log(`🌐 Railway URL: https://interviabackend-production.up.railway.app`)
    })
  } catch (error) {
    console.error('❌ Error starting server:', error)
    process.exit(1)
  }
}

startServer()

// Registration route
app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    console.log('\n📝 Registration Attempt:');
    console.log('1. Email:', email);
    console.log('2. First Name:', firstName);
    console.log('3. Last Name:', lastName);

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password, // The password will be hashed by the beforeCreate hook
      role: 'user'
    });

    console.log('✅ User created successfully:', email);
    res.status(201).json({ 
      message: 'Compte créé avec succès',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Erreur lors de la création du compte' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('\n🔑 Login Attempt Debug:');
    console.log('1. Email:', email);
    console.log('2. Password:', password);

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.status(401).json({ message: 'Email ou mot de passe invalide' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('3. Password validation result:', isValidPassword);

    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', email);
      return res.status(401).json({ message: 'Email ou mot de passe invalide' });
    }

    // Ensure JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET is not available for token generation');
      return res.status(500).json({ message: 'Authentication service is not properly configured' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Login successful for user:', email);
    res.json({ 
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
});

// Logout route
app.post('/api/logout', authMiddleware, async (req, res) => {
  try {
    console.log('🔓 Logout request for user ID:', req.userId);
    
    // In a more sophisticated implementation, you might want to:
    // 1. Add the token to a blacklist
    // 2. Update user's last logout time
    // 3. Clear any server-side sessions
    
    // For now, we'll just return success
    // The client is responsible for removing the token from storage
    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({ message: 'Erreur lors de la déconnexion' });
  }
});

// ✅ Middleware de protection (authMiddleware)
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('No authorization header');
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('No token found in header');
      return res.status(401).json({ message: 'Token manquant' });
    }

    console.log('Decoding token:', token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    if (!decoded.id) {
      console.log('No user ID in token');
      return res.status(401).json({ message: 'Token invalide' });
    }

    req.userId = decoded.id;
    console.log('User ID set in request:', req.userId);
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
}

// ✅ Route protégée pour le profil utilisateur
app.get('/api/user/profile', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching profile for user ID:', req.userId);
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      console.log('User not found:', req.userId);
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    console.log('User found:', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber
    });

    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role
    });
  } catch (error) {
    console.error('Error in /api/user/profile:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
  }
});

// ✅ Route protégée (exemple)
app.get('/api/dashboard', authMiddleware, (req, res) => {
  res.status(200).json({ message: `Bienvenue sur ton tableau de bord utilisateur ${req.userId} !` })
})

// ✅ Route protégée pour mettre à jour le profil
app.put('/api/user/profile', authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber } = req.body
    const user = await User.findByPk(req.userId)
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' })
    }

    // Check if email is already taken by another user
    if (email !== user.email) {
      const existingUser = await User.findOne({ where: { email } })
      if (existingUser) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' })
      }
    }

    // Update user fields
    user.firstName = firstName
    user.lastName = lastName
    user.email = email
    user.phoneNumber = phoneNumber

    await user.save()
    res.json({ message: 'Profil mis à jour avec succès' })
  } catch (error) {
    console.error('Error updating user profile:', error)
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' })
  }
})

// ✅ Route protégée pour changer le mot de passe
app.post('/api/user/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findByPk(req.userId)
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' })
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password)
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Mot de passe actuel incorrect.' })
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword
    await user.save()

    res.json({ message: 'Mot de passe modifié avec succès.' })
  } catch (err) {
    console.error('Erreur /api/user/change-password :', err)
    res.status(500).json({ message: 'Erreur lors du changement de mot de passe.' })
  }
})

// ✅ Route pour créer une nouvelle discussion
app.post('/api/discussions', authMiddleware, async (req, res) => {
  try {
    console.log('\n🔍 DEBUG: Discussion Creation Request');
    console.log('1. Headers:', req.headers);
    console.log('2. Raw body:', JSON.stringify(req.body, null, 2));
    
    const { title, cvAnalysis } = req.body;
    console.log('3. Extracted data:', {
      title,
      cvAnalysis,
      cvAnalysisType: cvAnalysis ? typeof cvAnalysis : 'null',
      cvAnalysisKeys: cvAnalysis ? Object.keys(cvAnalysis) : []
    });

    // Validate CV data
    if (cvAnalysis) {
      console.log('4. CV Analysis validation:');
      console.log('- Skills:', JSON.stringify(cvAnalysis.skills));
      console.log('- Experience:', JSON.stringify(cvAnalysis.experience));
      console.log('- Education:', JSON.stringify(cvAnalysis.education));
      console.log('- Summary:', cvAnalysis.summary);
    }

    // Prepare discussion data
    const discussionData = {
      title,
      userId: req.userId,
      lastMessageAt: new Date()
    };

    // Add CV data if it exists and is valid
    if (cvAnalysis && typeof cvAnalysis === 'object') {
      console.log('5. Adding CV data to discussion');
      try {
        // Convert arrays to JSON strings
        const skillsJson = JSON.stringify(cvAnalysis.skills || []);
        const experienceJson = JSON.stringify(cvAnalysis.experience || []);
        const educationJson = JSON.stringify(cvAnalysis.education || []);
        
        console.log('6. JSON Conversion Results:', {
          skillsJson,
          experienceJson,
          educationJson,
          summary: cvAnalysis.summary || ''
        });

        // Verify JSON strings are valid
        try {
          JSON.parse(skillsJson);
          JSON.parse(experienceJson);
          JSON.parse(educationJson);
          console.log('✅ All JSON strings are valid');
        } catch (error) {
          console.error('❌ Invalid JSON string:', error);
          throw error;
        }

        // Explicitly set each field
        discussionData.cvSkills = skillsJson;
        discussionData.cvExperience = experienceJson;
        discussionData.cvEducation = educationJson;
        discussionData.cvSummary = cvAnalysis.summary || '';
        
        console.log('7. Final discussion data:', JSON.stringify(discussionData, null, 2));
      } catch (error) {
        console.error('Error processing CV data:', error);
        throw error;
      }
    } else {
      console.log('5. No valid CV data provided');
    }

    // Create new discussion
    console.log('8. Creating discussion with data:', JSON.stringify(discussionData, null, 2));
    
    // Log the SQL query that will be executed
    const discussion = await Discussion.create(discussionData, {
      logging: (sql, timing) => {
        console.log('SQL Query:', sql);
        console.log('Query Timing:', timing);
      }
    });
    
    // Verify the created discussion
    console.log('9. Created discussion:', {
      id: discussion.id,
      title: discussion.title,
      cvSkills: discussion.cvSkills,
      cvExperience: discussion.cvExperience,
      cvEducation: discussion.cvEducation,
      cvSummary: discussion.cvSummary
    });

    // Double-check the database entry
    const savedDiscussion = await Discussion.findByPk(discussion.id, {
      logging: (sql, timing) => {
        console.log('Retrieval SQL Query:', sql);
        console.log('Retrieval Query Timing:', timing);
      }
    });
    
    console.log('10. Retrieved from database:', {
      id: savedDiscussion.id,
      title: savedDiscussion.title,
      cvSkills: savedDiscussion.cvSkills,
      cvExperience: savedDiscussion.cvExperience,
      cvEducation: savedDiscussion.cvEducation,
      cvSummary: savedDiscussion.cvSummary
    });

    // Check if the fields are actually in the database
    const [results] = await sequelize.query(
      'SELECT cv_skills, cv_experience, cv_education, cv_summary FROM Discussions WHERE id = ?',
      {
        replacements: [discussion.id],
        logging: (sql, timing) => {
          console.log('Direct SQL Query:', sql);
          console.log('Direct Query Timing:', timing);
        }
      }
    );
    
    console.log('11. Direct database check:', results[0]);
    
    res.status(201).json(discussion);
  } catch (err) {
    console.error('❌ Error in /api/discussions POST:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    res.status(500).json({ 
      message: 'Erreur lors de la création de la discussion.',
      error: err.message 
    });
  }
});

// ✅ Route pour récupérer toutes les discussions d'un utilisateur
app.get('/api/discussions', authMiddleware, async (req, res) => {
  try {
    const discussions = await Discussion.findAll({
      where: { userId: req.userId },
      order: [['lastMessageAt', 'DESC']],
      include: [{
        model: Message,
        limit: 1,
        order: [['createdAt', 'DESC']]
      }]
    })
    res.json(discussions)
  } catch (err) {
    console.error('Erreur /api/discussions GET :', err)
    res.status(500).json({ message: 'Erreur lors de la récupération des discussions.' })
  }
})

// ✅ Route pour récupérer une discussion spécifique avec ses messages
app.get('/api/discussions/:id', authMiddleware, async (req, res) => {
  try {
    const discussion = await Discussion.findOne({
      where: { 
        id: req.params.id,
        userId: req.userId
      },
      include: [{
        model: Message,
        order: [['createdAt', 'ASC']]
      }]
    });
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion non trouvée.' });
    }

    // Parse CV data if it exists
    const response = discussion.toJSON();
    function safeParse(json, fallback) {
      try {
        return JSON.parse(json);
      } catch {
        return fallback;
      }
    }
    if (response.cvSkills) {
      response.cvAnalysis = {
        skills: safeParse(response.cvSkills, []),
        experience: safeParse(response.cvExperience, []),
        education: safeParse(response.cvEducation, []),
        summary: response.cvSummary || ''
      };
      // Remove raw CV fields from response
      delete response.cvSkills;
      delete response.cvExperience;
      delete response.cvEducation;
      delete response.cvSummary;
    }
    
    res.json(response);
  } catch (err) {
    console.error('Erreur /api/discussions/:id GET :', err);
    res.status(500).json({ message: 'Erreur lors de la récupération de la discussion.' });
  }
});

// ✅ Route pour ajouter un message à une discussion
app.post('/api/discussions/:id/messages', authMiddleware, async (req, res) => {
  try {
    const { role, type, content, audioUrl, label } = req.body
    const discussion = await Discussion.findOne({
      where: { 
        id: req.params.id,
        userId: req.userId
      }
    })
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion non trouvée.' })
    }

    const message = await Message.create({
      discussionId: discussion.id,
      role,
      type,
      content,
      audioUrl,
      label
    })

    // Update discussion's lastMessageAt
    await discussion.update({ lastMessageAt: new Date() })

    res.status(201).json(message)
  } catch (err) {
    console.error('Erreur /api/discussions/:id/messages POST :', err)
    res.status(500).json({ message: 'Erreur lors de l\'ajout du message.' })
  }
})

// ✅ Route publique pour récupérer tous les plans (pour la landing page)
app.get('/api/plans/public', async (req, res) => {
  try {
    const plans = await Plan.findAll({
      where: { isActive: true },
      order: [['price', 'ASC']]
    })
    res.json(plans)
  } catch (error) {
    console.error('Error fetching public plans:', error)
    res.status(500).json({ message: 'Erreur lors de la récupération des plans' })
  }
})

// ✅ Route pour récupérer tous les plans (authentifiée)
app.get('/api/plans', authMiddleware, async (req, res) => {
  try {
    const plans = await Plan.findAll({
      where: { isActive: true },
      order: [['price', 'ASC']]
    })
    res.json(plans)
  } catch (error) {
    console.error('Error fetching plans:', error)
    res.status(500).json({ message: 'Erreur lors de la récupération des plans' })
  }
})

// ✅ Route pour récupérer l'abonnement actuel
app.get('/api/subscriptions/current', authMiddleware, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      where: {
        userId: req.userId,
        status: 'active',
        endDate: {
          [Op.gt]: new Date()
        }
      },
      include: [{
        model: Plan,
        attributes: ['name', 'price', 'features']
      }]
    })
    res.json(subscription)
  } catch (error) {
    console.error('Error fetching current subscription:', error)
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'abonnement' })
  }
})

// ✅ Route pour créer un nouvel abonnement
app.post('/api/subscriptions', authMiddleware, async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = await Plan.findByPk(planId);
    
    if (!plan) {
      return res.status(404).json({ message: 'Plan non trouvé' });
    }

    // Cancel any existing active subscription
    await Subscription.update(
      { status: 'cancelled' },
      {
        where: {
          userId: req.userId,
          status: 'active'
        }
      }
    );

    // Create new subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    const subscription = await Subscription.create({
      userId: req.userId,
      planId,
      startDate,
      endDate,
      status: 'active'
    });

    // Include plan details in response
    const subscriptionWithPlan = await Subscription.findByPk(subscription.id, {
      include: [{
        model: Plan,
        attributes: ['name', 'price', 'features']
      }]
    });

    res.status(201).json(subscriptionWithPlan);
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'abonnement' });
  }
});

// Create payment intent
app.post('/api/payments/create-intent', authMiddleware, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(501).json({ message: 'Stripe integration is not configured' });
    }

    const { planId, amount } = req.body;
    const userId = req.userId;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Le montant du paiement doit être supérieur à 0' });
    }

    // Get plan details to verify amount
    const plan = await Plan.findByPk(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan non trouvé' });
    }

    // Verify amount matches plan price
    const expectedAmount = Math.round(plan.price * 100); // Convert to cents
    if (amount !== expectedAmount) {
      return res.status(400).json({ 
        message: 'Le montant du paiement ne correspond pas au prix du plan',
        expectedAmount,
        receivedAmount: amount
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      metadata: {
        userId,
        planId
      }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la création du paiement',
      error: error.message 
    });
  }
});

// Handle successful payment
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(501).json({ message: 'Stripe integration is not configured' });
  }

  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const { userId, planId } = paymentIntent.metadata;

      // Get plan details
      const plan = await Plan.findByPk(planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      // Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.duration);

      // Create or update subscription
      await Subscription.create({
        userId,
        planId,
        startDate,
        endDate,
        status: 'active'
      });
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Get single plan
app.get('/api/plans/:id', authMiddleware, async (req, res) => {
  try {
    const plan = await Plan.findByPk(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan non trouvé' });
    }
    res.json(plan);
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du plan' });
  }
});

// ✅ Route pour mettre à jour le titre d'une discussion
app.put('/api/discussions/:id', authMiddleware, async (req, res) => {
  try {
    const { title } = req.body;
    const discussion = await Discussion.findOne({
      where: { 
        id: req.params.id,
        userId: req.userId
      }
    });
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion non trouvée.' });
    }

    await discussion.update({ title });
    res.json(discussion);
  } catch (err) {
    console.error('Erreur /api/discussions/:id PUT :', err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la discussion.' });
  }
});

// ✅ Route pour supprimer une discussion
app.delete('/api/discussions/:id', authMiddleware, async (req, res) => {
  try {
    console.log('Delete discussion request received:', {
      discussionId: req.params.id,
      userId: req.userId
    });

    // Validate discussion ID
    if (!req.params.id || isNaN(parseInt(req.params.id))) {
      console.log('Invalid discussion ID:', req.params.id);
      return res.status(400).json({ 
        message: 'ID de discussion invalide',
        error: 'INVALID_ID'
      });
    }

    const discussion = await Discussion.findOne({
      where: { 
        id: req.params.id,
        userId: req.userId
      }
    });
    
    if (!discussion) {
      console.log('Discussion not found:', {
        discussionId: req.params.id,
        userId: req.userId
      });
      return res.status(404).json({ 
        message: 'Discussion non trouvée',
        error: 'NOT_FOUND'
      });
    }

    console.log('Found discussion to delete:', {
      id: discussion.id,
      title: discussion.title,
      userId: discussion.userId
    });

    // Delete all messages associated with the discussion first
    const deletedMessages = await Message.destroy({
      where: { discussionId: discussion.id }
    });

    console.log('Deleted messages count:', deletedMessages);

    // Then delete the discussion
    await discussion.destroy();
    
    console.log('Discussion deleted successfully');
    return res.status(200).json({ 
      message: 'Discussion supprimée avec succès',
      success: true,
      deletedMessages
    });
  } catch (err) {
    console.error('Erreur /api/discussions/:id DELETE :', err);
    return res.status(500).json({ 
      message: 'Erreur lors de la suppression de la discussion',
      error: err.message,
      code: 'SERVER_ERROR'
    });
  }
});

// ✅ Route pour récupérer tous les abonnements d'un utilisateur
app.get('/api/subscriptions', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching subscriptions for user ID:', req.userId);
    
    const subscriptions = await Subscription.findAll({
      where: {
        userId: req.userId
      },
      include: [{
        model: Plan,
        attributes: ['name', 'price', 'features']
      }],
      order: [['createdAt', 'DESC']]
    });

    console.log('Found subscriptions:', JSON.stringify(subscriptions, null, 2));
    
    // Ensure each subscription has a plan
    const validSubscriptions = subscriptions.filter(sub => {
      if (!sub.Plan) {
        console.warn('Subscription missing plan:', sub.id);
        return false;
      }
      return true;
    });

    console.log('Valid subscriptions:', JSON.stringify(validSubscriptions, null, 2));
    
    res.json(validSubscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des abonnements' });
  }
});

// Meetings API Routes
// Get all meetings for a user
app.get('/api/meetings', authMiddleware, async (req, res) => {
  try {
    const meetings = await Meeting.findAll({
      where: { userId: req.userId },
      order: [['date', 'ASC']]
    });
    res.json(meetings);
  } catch (err) {
    console.error('Error fetching meetings:', err);
    res.status(500).json({ message: 'Erreur lors de la récupération des réunions.' });
  }
});

// Create a new meeting
app.post('/api/meetings', authMiddleware, async (req, res) => {
  try {
    const { title, date, duration, type } = req.body;
    
    const meeting = await Meeting.create({
      userId: req.userId,
      title,
      date,
      duration,
      type,
      status: 'scheduled'
    });
    
    res.status(201).json(meeting);
  } catch (err) {
    console.error('Error creating meeting:', err);
    res.status(500).json({ message: 'Erreur lors de la création de la réunion.' });
  }
});

// Update a meeting
app.put('/api/meetings/:id', authMiddleware, async (req, res) => {
  try {
    const { title, date, duration, type, status } = req.body;
    const meeting = await Meeting.findOne({
      where: { 
        id: req.params.id,
        userId: req.userId
      }
    });
    
    if (!meeting) {
      return res.status(404).json({ message: 'Réunion non trouvée.' });
    }

    await meeting.update({
      title,
      date,
      duration,
      type,
      status
    });
    
    res.json(meeting);
  } catch (err) {
    console.error('Error updating meeting:', err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la réunion.' });
  }
});

// Delete a meeting
app.delete('/api/meetings/:id', authMiddleware, async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      where: { 
        id: req.params.id,
        userId: req.userId
      }
    });
    
    if (!meeting) {
      return res.status(404).json({ message: 'Réunion non trouvée.' });
    }

    await meeting.destroy();
    res.json({ message: 'Réunion supprimée avec succès.' });
  } catch (err) {
    console.error('Error deleting meeting:', err);
    res.status(500).json({ message: 'Erreur lors de la suppression de la réunion.' });
  }
});

// ✅ Route pour récupérer les informations CV de l'utilisateur
app.get('/api/user/cv', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Parse the JSON strings back into arrays
    const cvData = {
      skills: user.cvSkills ? JSON.parse(user.cvSkills) : [],
      experience: user.cvExperience ? JSON.parse(user.cvExperience) : [],
      education: user.cvEducation ? JSON.parse(user.cvEducation) : [],
      summary: user.cvSummary || ''
    };

    res.json(cvData);
  } catch (error) {
    console.error('Error fetching CV data:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des données CV' });
  }
});

// Add payment routes
app.use('/api/payments', paymentRoutes);

// Add admin routes
app.use('/api/admin', adminRoutes);
