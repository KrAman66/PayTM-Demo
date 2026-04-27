import { Link } from "react-router-dom";

export function BottomWarning({label, buttonText, to, dark = false}) {
    return <div className={`py-2 text-sm flex justify-center ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
      <div>
        {label}
      </div>
      <Link className="pointer underline pl-1 cursor-pointer text-blue-600 dark:text-blue-400" to={to}>
        {buttonText}
      </Link>
    </div>
}
