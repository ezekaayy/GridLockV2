import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

interface LayoutProp {
    children: React.ReactNode;
}

export const Layout = ({children}: LayoutProp) => {
    return (
        <div>
            <Navbar />
            <main className="min-h-screen flex flex-col bg-background">{children}</main>
            <Footer />
        </div>
    )
}