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
      {!isFirstStep && (
        <button
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
          onClick={onSubmit}
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition disabled:bg-gray-400"
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
        <button
          onClick={onNext}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
          disabled={isSubmitting}
        >
          Next
        </button>
      )}
    </div>
  );
};

export default NavigationButtons;