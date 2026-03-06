export default function FloatingActionButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fab flex items-center justify-center bg-primary-color text-white rounded-full shadow-lg hover:bg-primary-dark focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-primary-dark  "
      aria-label="Add Workout"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={4}
          d="M12 4v16m8-8H4"
        />
      </svg>
    </button>
  );
}
