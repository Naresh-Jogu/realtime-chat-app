"use client";

export default function UserList({ users, onSelectUser }) {
  if (!users.length) {
    return <p className="p-4 text-sm text-gray-500">No other users found.</p>;
  }

  return (
    <div className="divide-y">
      {users.map((user) => (
        <button
          key={user._id}
          type="button"
          onClick={() => onSelectUser(user)}
          className="flex w-full items-center gap-3 p-4 text-left hover:bg-gray-100"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="font-medium">{user.name}</p>

            <p className="truncate text-sm text-gray-500">{user.email}</p>
          </div>

          <span
            className={`ml-auto h-2.5 w-2.5 rounded-full ${
              user.isOnline ? "bg-green-500" : "bg-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
