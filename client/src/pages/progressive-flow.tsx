import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../context/ApiContext';
import { useProgressiveFlow } from '../context/ProgressiveFlowContext';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { RxCross1 } from 'react-icons/rx';

export default function ProgressiveFlow() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'client' | 'provider' | null>(null);
  const [hasError, setHasError] = useState(false);

  // Error boundary effect
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Progressive Flow Error:', event.error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Une erreur s'est produite</h2>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }

  const { signup } = useAuth();
  const { createMission, getMissions, getProjects } = useApi();
  const {
    progress,
    setProgress,
    missionDetails,
    setMissionDetails,
    projectDetails,
    setProjectDetails,
    clientDetails,
    setClientDetails,
    providerDetails,
    setProviderDetails,
  } = useProgressiveFlow();

  // Function to handle user type selection
  const handleUserTypeSelect = (type: 'client' | 'provider') => {
    setUserType(type);
    setProgress((prev) => ({ ...prev, userType: type }));
    if (type === 'client') {
      navigate('/progressive-flow/client-details');
    } else {
      navigate('/progressive-flow/provider-details');
    }
  };

  // Function to create a mission
  const createNewMission = async () => {
    try {
      // Ensure missionDetails and clientDetails are properly populated
      if (!missionDetails || !clientDetails) {
        console.error('Mission or client details are incomplete.');
        // Optionally, set an error state or redirect to a form
        return; 
      }

      const response = await createMission({
        mission: {
          name: missionDetails.name,
          description: missionDetails.description,
          budget: missionDetails.budget,
          deadline: missionDetails.deadline,
          skills: missionDetails.skills,
        },
        client: {
          companyName: clientDetails.companyName,
          email: clientDetails.email,
          address: clientDetails.address,
          country: clientDetails.country,
          city: clientDetails.city,
        },
      });

      if (response.ok) {
        console.log('Mission created successfully:', response.data);
        // Optionally clear state or navigate away
        setMissionDetails(null);
        setClientDetails(null);
        navigate('/dashboard'); // Or a success page
      } else {
        // Handle API errors more specifically if possible
        console.error('Failed to create mission:', response.error || response.statusText);
        // Update UI to show error to user
      }
    } catch (error) {
      console.error('Error creating mission:', error);
      // Update UI to show error to user
    }
  };

  // Function to fetch and display missions
  const fetchAndDisplayMissions = async () => {
    try {
      const response = await getMissions();
      if (response.ok) {
        console.log('Missions:', response.data);
        // Logic to display missions
      } else {
        console.error('Failed to fetch missions:', response.error || response.statusText);
      }
    } catch (error) {
      console.error('Error fetching missions:', error);
    }
  };

  // Function to fetch and display projects (consider deprecation)
  const fetchAndDisplayProjects = async () => {
    try {
      // As per logs, this API might be deprecated and replaced by missions API.
      // It's important to check if this endpoint is still valid or if calls should be redirected to getMissions.
      const response = await getProjects(); 
      if (response.ok) {
        console.log('Projects:', response.data);
        // Logic to display projects
      } else {
        // Log a warning or error if the API is indeed deprecated
        console.warn('Failed to fetch projects, this API might be deprecated. Status:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // Effect to handle initial state or data fetching if needed
  useEffect(() => {
    // Example: Fetch initial data if required upon component mount
    // fetchAndDisplayMissions();
    // fetchAndDisplayProjects(); // Be cautious with this call due to deprecation
  }, []);

  return (
    <div className="container mx-auto p-4">
      {!userType && (
        <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
          <h1 className="text-3xl font-bold mb-4">Bienvenue ! Quel type d'utilisateur êtes-vous ?</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => handleUserTypeSelect('client')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
            >
              Client
            </button>
            <button
              onClick={() => handleUserTypeSelect('provider')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-300"
            >
              Prestataire
            </button>
          </div>
        </div>
      )}

      {/* Render other parts of the flow based on progress and userType */}
      {/* For example, conditional rendering for clientDetails, providerDetails, missionDetails etc. */}
      {/* This is a placeholder, actual routing and state management will handle navigation */}
    </div>
  );
}