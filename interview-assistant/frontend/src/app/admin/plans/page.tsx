'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Loader2,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  Users
} from 'lucide-react';
import { getUserData } from '@/utils/auth';
import { usePageMetadata, PAGE_METADATA } from '@/utils/pageMetadata';

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    isActive: true,
    features: [] as string[]
  });
  const router = useRouter();

  // Use the page metadata hook
  usePageMetadata(PAGE_METADATA.ADMIN_PLANS);

  useEffect(() => {
    // Check if user is logged in and has admin role
    const user = getUserData();
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchPlans();
  }, [router]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching plans...');
      const { adminService } = await import('@/services/adminService');
      const data = await adminService.getPlans();
      console.log('Plans fetched successfully:', data);
      
      setPlans(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching plans:', err);
      const errorMessage = err instanceof Error ? err.message : 'Échec du chargement des forfaits';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce forfait ?')) {
      try {
        const { adminService } = await import('@/services/adminService');
        await adminService.deletePlan(id);
        fetchPlans(); // Refresh the list
      } catch (err) {
        console.error('Error deleting plan:', err);
        alert('Échec de la suppression du forfait. Veuillez réessayer.');
      }
    }
  };

  const togglePlanStatus = async (plan: Plan) => {
    try {
      const { adminService } = await import('@/services/adminService');
      await adminService.updatePlan(plan.id, {
        ...plan,
        isActive: !plan.isActive
      });
      fetchPlans(); // Refresh the list
    } catch (err) {
      console.error('Error updating plan:', err);
      alert('Échec de la mise à jour du forfait. Veuillez réessayer.');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Validate form data
      if (!formData.name.trim()) {
        throw new Error('Le nom du forfait est requis');
      }
      if (!formData.description.trim()) {
        throw new Error('La description du forfait est requise');
      }
      if (formData.price < 0) {
        throw new Error('Le prix doit être un nombre positif');
      }
      if (formData.duration <= 0) {
        throw new Error('La durée doit être un nombre positif');
      }

      console.log('Saving plan data:', formData);
      
      const { adminService } = await import('@/services/adminService');
      
      if (editingPlan) {
        // Update existing plan
        console.log('Updating plan:', editingPlan.id);
        await adminService.updatePlan(editingPlan.id, {
          ...editingPlan,
          ...formData
        });
        console.log('Plan updated successfully');
      } else {
        // Create new plan
        console.log('Creating new plan');
        const result = await adminService.createPlan(formData);
        console.log('Plan created successfully:', result);
      }
      
      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        price: 0,
        duration: 30,
        isActive: true,
        features: []
      });
      setShowCreateModal(false);
      setEditingPlan(null);
      
      // Show success message
      const successMessage = editingPlan ? 'Forfait mis à jour avec succès !' : 'Forfait créé avec succès !';
      setSuccess(successMessage);
      setTimeout(() => setSuccess(null), 3000);
      
      // Refresh plans list
      await fetchPlans();
    } catch (err) {
      console.error('Error saving plan:', err);
      const errorMessage = err instanceof Error ? err.message : 'Échec de la sauvegarde du forfait. Veuillez réessayer.';
      setError(errorMessage);
      // Don't close modal on error, let user fix the issue
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      duration: plan.duration,
      isActive: plan.isActive,
      features: plan.features || []
    });
  };

  const handleCancel = () => {
    setShowCreateModal(false);
    setEditingPlan(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      duration: 30,
      isActive: true,
      features: []
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
          <p className="text-gray-600">Chargement des forfaits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-72">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Forfaits d'Abonnement</h1>
              <p className="mt-2 text-sm text-gray-600">Gérez vos forfaits d'abonnement et tarifs</p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Ajouter un Forfait
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
              <button 
                onClick={fetchPlans}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Réessayer
              </button>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800">{success}</p>
            </div>
          )}

          {/* Plans Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        plan.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {plan.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-green-600 mr-1" />
                      <span className="text-2xl font-bold text-gray-900">${plan.price}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {plan.duration} jours
                    </div>
                  </div>

                  {plan.features && plan.features.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Fonctionnalités :</h4>
                      <ul className="space-y-1">
                        {plan.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                        {plan.features.length > 3 && (
                          <li className="text-sm text-gray-500">
                            +{plan.features.length - 3} autres fonctionnalités
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(plan)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Modifier le forfait"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => togglePlanStatus(plan)}
                        className={`p-2 rounded-lg transition-colors ${
                          plan.isActive 
                            ? 'text-red-400 hover:text-red-600 hover:bg-red-50' 
                            : 'text-green-400 hover:text-green-600 hover:bg-green-50'
                        }`}
                        title={plan.isActive ? 'Désactiver le forfait' : 'Activer le forfait'}
                      >
                        {plan.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer le forfait"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {plans.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun forfait trouvé</h3>
              <p className="text-gray-600 mb-6">Commencez par créer votre premier forfait d'abonnement.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Créer un Forfait
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Plan Modal */}
      {(showCreateModal || editingPlan) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingPlan ? 'Modifier le Forfait' : 'Créer un Nouveau Forfait'}
            </h2>
            
            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Forfait *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="ex: Forfait Basique"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="Décrivez les fonctionnalités du forfait..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durée (jours) *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="30"
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Forfait actif
                </label>
              </div>
            </form>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  editingPlan ? 'Mettre à jour' : 'Créer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 