export default function FormattingText({ 
  children, 
  color = '#000000',
  backgroundColor = 'transparent',
  level = 1,
  size = 'medium'
}) {
  // Define heading level configurations
  const headingStyles = {
    // Heading Level 1
    1: {
      small: { fontSize: '24px', fontWeight: '700' },
      medium: { fontSize: '32px', fontWeight: '700' },
      large: { fontSize: '40px', fontWeight: '700' }
    },
    // Heading Level 2
    2: {
      small: { fontSize: '20px', fontWeight: '600' },
      medium: { fontSize: '28px', fontWeight: '600' },
      large: { fontSize: '36px', fontWeight: '600' }
    },
    // Heading Level 3
    3: {
      small: { fontSize: '16px', fontWeight: '500' },
      medium: { fontSize: '24px', fontWeight: '500' },
      large: { fontSize: '30px', fontWeight: '500' }
    }
  };

  const baseStyle = {
    color,
    backgroundColor,
    padding: '4px 8px',
    borderRadius: '4px',
    display: 'block',
    ...headingStyles[level][size]
  };

  return <div style={baseStyle}>{children}</div>;
}
