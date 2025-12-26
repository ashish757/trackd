import {Link} from "react-router-dom";

export default function LandingPage() {

    return (
        <div className="bg-white pb-20 md:pb-0">
            <nav aria-label="Global" className="flex items-center justify-between p-4 md:p-6 lg:px-32">
                <div className="flex lg:flex-1">
                    <a href="#" className="flex justify-center items-center gap-2">
                        <img alt="" src="/logo.svg" className="h-8 w-auto" />
                        <span className="text-lg md:text-xl font-semibold">Trackd</span>
                    </a>
                </div>
            </nav>

            <div className="relative isolate px-4 md:px-6 pt-8 md:pt-14 lg:px-8">

                {/*background design element*/}
                <div aria-hidden="true" className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" >
                    <div style={{
                            clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                        className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-288.75"
                    />
                </div>

                <div className="mx-auto max-w-3xl py-12 md:py-8 lg:py-8">

                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 sm:text-7xl leading-tight">
                            Track <span className="text-indigo-700">what you watch.</span> Discover <span className="text-indigo-700">what to watch.</span>
                        </h1>
                        <p className="mt-6 md:mt-8 text-base md:text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
                            Track what you watch. Discover what to watch next.
                        </p>
                        <div className="mt-8 md:mt-10 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-x-6 px-4">
                            <Link to="/home" className="w-full md:w-auto rounded-lg md:rounded-md bg-indigo-600 px-6 md:px-3.5 py-3 md:py-2.5 text-base md:text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors text-center">
                                Get started
                            </Link>
                            <Link to={"/signin"} className="w-full md:w-auto text-base md:text-sm font-semibold text-gray-900 py-3 md:py-0 text-center md:text-left">
                                Sign in <span aria-hidden="true">&rarr;</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/*background design element*/}
                <div aria-hidden="true" className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
                    <div style={{
                            clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                        className="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-288.75"
                    />
                </div>

            </div>
        </div>
    )
}
