export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
      {/* Image placeholder */}
      <div className="w-24 h-24 mx-auto bg-gray-300 rounded-lg mb-3"></div>
      
      {/* ID placeholder */}
      <div className="h-4 bg-gray-300 rounded w-16 mx-auto mb-2"></div>
      
      {/* Name placeholder */}
      <div className="h-5 bg-gray-300 rounded w-3/4 mx-auto mb-3"></div>
      
      {/* Types placeholder */}
      <div className="flex gap-2 justify-center mb-3">
        <div className="h-6 bg-gray-300 rounded w-16"></div>
        <div className="h-6 bg-gray-300 rounded w-16"></div>
      </div>
      
      {/* Stats placeholder */}
      <div className="h-4 bg-gray-300 rounded w-20 mx-auto"></div>
    </div>
  );
}