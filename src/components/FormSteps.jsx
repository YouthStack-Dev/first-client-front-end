import React from 'react';
import { UserCircle, MapPin, ClipboardList } from 'lucide-react';

const FormSteps = ({ currentStep, completedSteps }) => {
  const steps = [
    {
      id: 'personalInfo',
      label: 'PERSONAL INFO',
      icon: <UserCircle className="w-5 h-5" />,
    },
    {
      id: 'address',
      label: 'ADDRESS',
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      id: 'moreDetails',
      label: 'MORE DETAILS',
      icon: <ClipboardList className="w-5 h-5" />,
    },
  ];

  return (
    <div className="flex items-center border-b pb-4 mb-8">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id);
        const isActive = currentStep === step.id;

        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center">
              <div
                className={`
                  rounded-full flex items-center justify-center w-8 h-8 
                  ${isCompleted || isActive ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
                  transition-all duration-300
                `}
              >
                {isCompleted ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  step.icon
                )}
              </div>
              <span
                className={`
                  ml-2 font-medium 
                  ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}
                `}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`
                  h-0.5 w-16 mx-2 
                  ${completedSteps.includes(steps[index + 1].id) ? 'bg-green-500' : 'bg-gray-200'}
                  transition-all duration-300
                `}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default FormSteps;
