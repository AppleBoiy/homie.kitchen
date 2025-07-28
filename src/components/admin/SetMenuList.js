export default function SetMenuList({ setMenus, onEdit, onDelete, onAdd }) {
  return (
    <div>
      {setMenus.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No set menus yet.</div>
      ) : (
        <div className="space-y-4">
          {setMenus.map(setMenu => (
            <div key={setMenu.id} className="bg-white rounded-lg shadow border p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{setMenu.name}</h3>
                <p className="text-gray-600 text-sm mb-1">{setMenu.description}</p>
                <span className="text-orange-600 font-bold text-base">${setMenu.price.toFixed(2)}</span>
                <span className={`ml-3 px-2 py-1 rounded-full text-xs font-semibold ${setMenu.is_available ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>{setMenu.is_available ? 'Available' : 'Unavailable'}</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(setMenu)}
                  className="bg-slate-600 text-white px-3 py-1 rounded hover:bg-slate-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(setMenu.id)}
                  className="bg-rose-600 text-white px-3 py-1 rounded hover:bg-rose-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 