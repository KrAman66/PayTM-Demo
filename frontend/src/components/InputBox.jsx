
export function InputBox({label, placeholder, onChange, error}) {
    return <div>
      <div className="text-sm font-medium text-left py-2">
        {label}
      </div>
      <input onChange={onChange} placeholder={placeholder} className={`w-full px-2 py-1 border rounded ${error ? 'border-red-500' : 'border-slate-200'}`} />
      {error && <p className="text-xs text-red-500 text-left mt-1">{error}</p>}
    </div>
}