'use client';

import React from 'react';
import Link from 'next/link';
import { getHoverEffect, buttonVariants } from '@/lib/buttonStyles';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  href,
  asChild = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  ...props
}) => {
  // Get base styles based on variant
  const variantStyles = buttonVariants[variant] || buttonVariants.primary;
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };
  
  // Generate dynamic hover effect
  const { base, hover, focus, active, child, text } = getHoverEffect(
    variantStyles.base,
    variantStyles.hover
  );
  
  const buttonClasses = `
    inline-flex items-center justify-center rounded-lg font-medium
    transition-all duration-300 relative overflow-hidden
    ${sizeClasses[size]}
    ${base} ${hover} ${focus} ${active}
    ${className}
  `;
  
  // Render as button or link
  const content = (
    <>
      {LeftIcon && <LeftIcon className="w-5 h-5 mr-2" />}
      <span className={text}>{children}</span>
      {RightIcon && <RightIcon className="w-5 h-5 ml-2" />}
      <span className={child} aria-hidden="true" />
    </>
  );
  
  if (href) {
    return (
      <Link href={href} className={buttonClasses} {...props}>
        {content}
      </Link>
    );
  }
  
  if (asChild) {
    return React.cloneElement(React.Children.only(children), {
      className: `${buttonClasses} ${children.props.className || ''}`,
      children: (
        <>
          {content}
          {children.props.children}
        </>
      ),
    });
  }
  
  return (
    <button className={buttonClasses} {...props}>
      {content}
    </button>
  );
};

export default Button;
