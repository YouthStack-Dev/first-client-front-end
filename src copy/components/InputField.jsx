// Inside InputField.jsx
const InputField = ({ label, name, type, value, onChange, options = [], ...rest }) => {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="font-medium">{label}</label>

      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e)}
          {...rest}
          className="border p-2 rounded"
        />
      ) : type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e)}
          {...rest}
          className="border p-2 rounded"
        >
          <option value="">-- Select --</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e)}
          {...rest}
          className="border p-2 rounded"
        />
      )}
    </div>
  );
};

export default InputField;
