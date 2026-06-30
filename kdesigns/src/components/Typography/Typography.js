import React from 'react';
const Typography = ({ variant:Variant,className='', children,style,onClick }) => {
  return (
    <Variant style={style} className={`p-component kn-typography kn-typography--${Variant} ${className}`} onClick={onClick}>
      {children}
    </Variant>
  );
};
Typography.defaultProps={
  variant:"h5",
  onClick:()=>{}
}

export default Typography;


// Sample Code

//  <Typography variant="h1">This is an H1 heading</Typography>
