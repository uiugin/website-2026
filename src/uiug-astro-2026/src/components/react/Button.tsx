import React from 'react';
import type { LucideProps } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'yellow';
  icon?: React.ComponentType<LucideProps>;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  icon: Icon, 
  children, 
  className = '',
  ...props 
}) => {
  const baseStyles = "px-6 py-4 md:py-6 font-display text-lg md:text-xl border-4 border-black dark:border-white transition-all duration-100 uppercase flex items-center justify-center gap-2 active:translate-x-1 active:translate-y-1 active:shadow-none";
  
  const variants = {
    primary: "bg-primary text-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black shadow-brutal-black dark:shadow-brutal-white",
    outline: "bg-transparent text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black",
    yellow: "bg-accent-yellow text-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black shadow-brutal-black dark:shadow-brutal-white"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
      {Icon && <Icon className="w-6 h-6" />}
    </button>
  );
};

export default Button;

