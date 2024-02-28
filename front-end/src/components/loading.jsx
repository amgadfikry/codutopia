// loading spinning component while waiting for data to load
// loading component to display loading spinner
function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-light-red"></div>
    </div>
  )
}

export default Loading;
