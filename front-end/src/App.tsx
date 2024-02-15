function App() {

const handleData = () => {
    console.log('fetching data');
    fetch('http://172.28.0.5:3000') 
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.log(error));
};
    

    return (
    <>
        <h1 className="font-bold text-center text-3xl underline text-violet-500">Frontend</h1>
        <div className="flex justify-center items-center p-8">
        <button className="bg-red-400 border px-6 py-2 border-gray-400 rounded-lg" onClick={handleData}>
          data 
        </button>
    </div>
    </>
    )
}

export default App
