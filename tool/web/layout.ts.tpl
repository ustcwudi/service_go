import React, { Component } from 'react';
import {{.Name}}Table from './table';

export default (props: { children: Component }) => {
  return (
    <>
      <{{.Name}}Table canSelect="checkbox" />
      {props.children}
    </>
  );
};
