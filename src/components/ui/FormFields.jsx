
const FormField = ({ 
    label, 
    name, 
    required = false, 
    error,
    children 
  }) => {
    return (
      <div className="mb-4">
        <label 
          htmlFor={name} 
          className="block text-gray-700 mb-2"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {error && (
          <div className="flex items-center mt-1 text-red-600 text-sm">
            <div className="flex-shrink-0 w-5 h-5 mr-1 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">
              !
            </div>
            {error}
          </div>
        )}
      </div>
    );
  };
  
  export default FormField;
  