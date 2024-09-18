const Landing = () => {
    return (
        <div className="text-center p-12 bg-gray-100">
            <header className="mb-12">
                <h1 className="text-5xl font-bold text-gray-800">Welcome to My Website</h1>
                <p className="text-xl text-gray-600 mt-4">Your journey to excellence starts here.</p>
                <a href="#get-started" className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-500">
                    Get Started
                </a>
            </header>
            <section className="my-12">
                <h2 className="text-3xl font-semibold text-gray-800">Features</h2>
                <ul className="list-none mt-6 space-y-4">
                    <li className="text-xl text-gray-600">Feature 1</li>
                    <li className="text-xl text-gray-600">Feature 2</li>
                    <li className="text-xl text-gray-600">Feature 3</li>
                </ul>
            </section>
            <footer className="mt-12 text-sm text-gray-500">
                <p>&copy; 2023 My Website. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Landing;