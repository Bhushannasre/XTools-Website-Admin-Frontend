import  { useState } from "react";

function RefreshButton() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);

    // Small animation before refreshing
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={refreshing}
      title="Refresh page"
      className="
        inline-flex
        items-center
        justify-center
        gap-2
        h-10
        px-4
        rounded-lg
        border
        border-gray-700
        bg-gray-900
        text-gray-200
        hover:bg-gray-800
        hover:border-gray-600
        transition-all
        duration-200
        disabled:opacity-60
        disabled:cursor-not-allowed
      "
    >
      <svg
        className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12a9 9 0 1 1-3-6.7" />
        <polyline points="21 3 21 9 15 9" />
      </svg>

      <span>
        {refreshing ? "Refreshing..." : "Refresh"}
      </span>
    </button>
  );
}

export default RefreshButton;