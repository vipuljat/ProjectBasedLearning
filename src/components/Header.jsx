import { Home, LayoutGrid, User } from "lucide-react";
import { Link } from 'react-router-dom';

export default function Header() {
    return (
        <header className="border-b border-[#141824] p-6 bg-gradient-to-r from-[#0C111D] via-[#1A233B] to-[#0C111D] shadow-lg shadow-[#4AB8FF]/30 hover:shadow-xl hover:shadow-[#4AB8FF]/50 transition-shadow duration-300">
            <div className="w-full px-6 flex justify-between items-center mx-auto max-w-7xl">
                <Link to="/" className="flex items-center gap-3 group">
                    {/* Logo circle with animation */}
                    <div className="bg-[#3B22CE] w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-[#0095FF] transition-all duration-300 transform group-hover:scale-110">
                        <div className="bg-[#0095FF] w-5 h-5 rounded-full"></div>
                    </div>
                    {/* Text with animation */}
                    <span className="text-xl font-extrabold group-hover:text-[#0095FF] transition-all duration-300">ProjectMatch</span>
                </Link>

                <nav className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-2 hover:text-[#4AB8FF] transition-colors duration-300 text-[#F2F2F2]">
                        <Home size={20} />
                        <span className="text-sm font-medium">Home</span>
                    </Link>
                    <Link to="/projects" className="flex items-center gap-2 hover:text-[#4AB8FF] transition-colors duration-300 text-[#F2F2F2]">
                        <LayoutGrid size={20} />
                        <span className="text-sm font-medium">Projects</span>
                    </Link>
                    <Link to="/profile" className="flex items-center gap-2 hover:text-[#4AB8FF] transition-colors duration-300 text-[#F2F2F2]">
                        <User size={20} />
                        <span className="text-sm font-medium">Profile</span>
                    </Link>
                </nav>
            </div>
        </header>
    );
}