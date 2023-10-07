import React, { useState, useEffect } from 'react';
import Table from './components/table';

export default function App() {
    const [lightSwitch, setLightSwitch] = useState('On');
    
    return (<Table />)
}

