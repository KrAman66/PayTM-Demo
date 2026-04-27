export function InputBox({label, placeholder, onChange, error, type = "text", dark = false}) {
    return <div>
      <div className={`text-sm font-medium text-left py-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
        {label}
      </div>
      <input
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        className={`w-full px-2 py-1 border rounded ${error ? 'border-red-500' : dark ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-200'}`}
      />
      {error && <p className="text-xs text-red-500 text-left mt-1">{error}</p>}
    </div>
}
