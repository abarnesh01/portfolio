import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CustomCursor = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseDown = () => setIsClicked(true);
        const handleMouseUp = () => setIsClicked(false);

        const handleMouseOver = (e) => {
            const target = e.target;
            if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('.hover-trigger')) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    return (
        <>
            {/* Outer Ring */}
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 rounded-full border border-[#00f5ff]/50 pointer-events-none z-[10000] hidden md:block"
                animate={{
                    x: mousePosition.x - 16,
                    y: mousePosition.y - 16,
                    scale: isHovering ? 2 : 1,
                    borderColor: isHovering ? '#8a2be2' : '#00f5ff',
                    opacity: isClicked ? 0.5 : 1
                }}
                transition={{ type: 'spring', damping: 20, stiffness: 250, mass: 0.5 }}
            />

            {/* Inner Dot */}
            <motion.div
                className="fixed top-0 left-0 w-2 h-2 rounded-full bg-[#00f5ff] pointer-events-none z-[10000] shadow-[0_0_10px_#00f5ff] hidden md:block"
                animate={{
                    x: mousePosition.x - 4,
                    y: mousePosition.y - 4,
                    scale: isHovering ? 1.5 : 1
                }}
                transition={{ type: 'spring', damping: 30, stiffness: 500, mass: 0.1 }}
            />

            {/* Click Pulse Effect */}
            {isClicked && (
                <motion.div
                    initial={{ opacity: 0.5, scale: 0 }}
                    animate={{ opacity: 0, scale: 4 }}
                    className="fixed top-0 left-0 w-10 h-10 rounded-full border-2 border-[#00f5ff] pointer-events-none z-[10000] hidden md:block"
                    style={{ x: mousePosition.x - 20, y: mousePosition.y - 20 }}
                />
            )}
        </>
    );
};

export default CustomCursor;
