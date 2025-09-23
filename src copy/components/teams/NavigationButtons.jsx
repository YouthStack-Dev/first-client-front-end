import React from 'react';

const NavigationButtons = ({
  currentStep,
  onBack,
  onNext,
  onSubmit,
  isLastStep,
  isFirstStep,
  isSubmitting,
  mode,
}) => {

  
  return (
    <div className="flex justify-between mt-6">
      {!isFirstStep && mode !== 'view' && (
        <button
        type="button"
          onClick={onBack}
          className="bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400 transition"
          disabled={isSubmitting}
        >
          Back
        </button>
      )}
      <div className="flex-1" />
      {isLastStep ? (
        <button
        type="button"
          onClick={onSubmit}
          className={`${
            mode === 'view' ? 'bg-gray-500 hover:bg-gray-600' : 'bg-green-500 hover:bg-green-600'
          } text-white p-2 rounded transition disabled:bg-gray-400`}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Submitting...'
            : mode === 'view'
            ? 'Close'
            : mode === 'create'
            ? 'Create Employee'
            : 'Update Employee'}
        </button>
      ) : (
        mode !== 'view' && (  
          <button
          type="button"
            onClick={onNext}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
            disabled={isSubmitting}
          >
            Next
          </button>
        )
      )}
    </div>
  );
};

export default NavigationButtons;