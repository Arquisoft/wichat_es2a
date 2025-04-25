// src/components/AvatarEditor.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, ToggleButtonGroup, ToggleButton, IconButton } from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';
import BrushIcon from '@mui/icons-material/Brush';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TagFacesIcon from '@mui/icons-material/TagFaces';

const AvatarEditor = ({ avatarOptions, setAvatarOptions }) => {
    const [activeCategory, setActiveCategory] = useState('skin');
    const [avatarUrl, setAvatarUrl] = useState('');

    // Actualizar avatar dinámicamente
    useEffect(() => {
        const { hairColor, eyes, hair, mouth, skinColor } = avatarOptions;
        const url = `https://api.dicebear.com/9.x/big-smile/svg?hairColor=${hairColor}&eyes=${eyes}&hair=${hair}&mouth=${mouth}&skinColor=${skinColor}`;
        setAvatarUrl(url);
    }, [avatarOptions]);

    // Handler para cambiar una propiedad
    const handleChange = (field, value) => {
        if (value) {
            setAvatarOptions(prev => ({ ...prev, [field]: value }));
        }
    };

    return (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Box sx={{
                width: '200px',
                height: '200px',
                margin: '0 auto 16px',
                borderRadius: '50%',
                overflow: 'hidden',
                boxShadow: 2
            }}>
                <img
                    src={avatarUrl}
                    alt="Avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </Box>

            {/* Botones de categoría */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                <IconButton onClick={() => setActiveCategory('skin')} color={activeCategory === 'skin' ? 'primary' : 'default'}>
                    <PaletteIcon fontSize="large" />
                </IconButton>
                <IconButton onClick={() => setActiveCategory('hair')} color={activeCategory === 'hair' ? 'primary' : 'default'}>
                    <BrushIcon fontSize="large" />
                </IconButton>
                <IconButton onClick={() => setActiveCategory('eyes')} color={activeCategory === 'eyes' ? 'primary' : 'default'}>
                    <VisibilityIcon fontSize="large" />
                </IconButton>
                <IconButton onClick={() => setActiveCategory('mouth')} color={activeCategory === 'mouth' ? 'primary' : 'default'}>
                    <TagFacesIcon fontSize="large" />
                </IconButton>
            </Box>

            {/* Contenido según categoría */}
            {activeCategory === 'skin' && (
                <Box>
                    <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                        Select Eye Style
                    </Typography>
                    <ToggleButtonGroup
                        value={avatarOptions.skinColor}
                        exclusive
                        onChange={(e, val) => val && handleChange('skinColor', val)}
                        color="primary"
                        size="small"
                        sx={{
                            flexWrap: 'wrap',
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 1
                        }}
                    >
                        <ToggleButton value="643d19">Deep Brown</ToggleButton>
                        <ToggleButton value="8c5a2b">Espresso</ToggleButton>
                        <ToggleButton value="a47539">Bronze</ToggleButton>
                        <ToggleButton value="c99c62">Tan</ToggleButton>
                        <ToggleButton value="e2ba87">Ligth Tan</ToggleButton>
                        <ToggleButton value="efcc9f">Beige</ToggleButton>
                        <ToggleButton value="f5d7b1">Ligth Beige</ToggleButton>
                        <ToggleButton value="ffe4c0">Porcelain</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            )}
            {/* Pelo */}
            {activeCategory === 'hair' && (
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Box>
                        <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                            Select Hair Color
                        </Typography>
                        <ToggleButtonGroup
                            value={avatarOptions.hairColor}
                            exclusive
                            onChange={(e, val) => val && handleChange('hairColor', val)}
                            color="primary"
                            size="small"
                            sx={{
                                flexWrap: 'wrap',
                                display: 'flex',
                                justifyContent: 'center',
                                gap: 1
                            }}
                        >
                            <ToggleButton value="3a1a00">Brown</ToggleButton>
                            <ToggleButton value="e2ba87">Blonde</ToggleButton>
                            <ToggleButton value="220f00">Black</ToggleButton>
                            <ToggleButton value="238d80">Green</ToggleButton>
                            <ToggleButton value="605de4">Blue</ToggleButton>
                            <ToggleButton value="d56c0c">Orange</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    <Box>
                        <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                            Select Type Hair
                        </Typography>
                        <ToggleButtonGroup
                            value={avatarOptions.hair}
                            exclusive
                            onChange={(e, val) => val && handleChange('hair', val)}
                            color="primary"
                            size="small"
                            sx={{
                                flexWrap: 'wrap',
                                display: 'flex',
                                justifyContent: 'center',
                                gap: 1
                            }}
                        >
                            <ToggleButton value="bangs">bangs</ToggleButton>
                            <ToggleButton value="shortHair">shortHair</ToggleButton>
                            <ToggleButton value="bowlCutHair">bowlCutHair</ToggleButton>
                            <ToggleButton value="bunHair">bunHair</ToggleButton>
                            <ToggleButton value="curlyBob">curlyBob</ToggleButton>
                            <ToggleButton value="curlyShortHair">curlyShortHair</ToggleButton>
                            <ToggleButton value="froBun">froBun</ToggleButton>
                            <ToggleButton value="halfShavedHead">halfShavedHead</ToggleButton>
                            <ToggleButton value="mohawk">mohawk</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                </Box>
            )}

            {activeCategory === 'eyes' && (
                <Box>
                    <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                        Select Eye Style
                    </Typography>
                    <ToggleButtonGroup
                        value={avatarOptions.eyes}
                        exclusive
                        onChange={(e, val) => val && handleChange('eyes', val)}
                        color="primary"
                        size="small"
                        sx={{
                            flexWrap: 'wrap',
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 1
                        }}
                    >
                        <ToggleButton value="angry">angry</ToggleButton>
                        <ToggleButton value="cheery">cheery</ToggleButton>
                        <ToggleButton value="confused">confused</ToggleButton>
                        <ToggleButton value="normal">normal</ToggleButton>
                        <ToggleButton value="sad">sad</ToggleButton>
                        <ToggleButton value="sleepy">sleepy</ToggleButton>
                        <ToggleButton value="starstruck">starstruck</ToggleButton>
                        <ToggleButton value="winking">winking</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            )}

            {activeCategory === 'mouth' && (
                <Box>
                    <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                        Select Mouth Style
                    </Typography>
                    <ToggleButtonGroup
                        value={avatarOptions.mouth}
                        exclusive
                        onChange={(e, val) => val && handleChange('mouth',val)}
                        color="primary"
                        size="small"
                        sx={{
                            flexWrap: 'wrap',
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 1
                        }}
                    >
                        <ToggleButton value="awkwardSmile">awkwardSmile</ToggleButton>
                        <ToggleButton value="braces">braces</ToggleButton>
                        <ToggleButton value="gapSmile">gapSmile</ToggleButton>
                        <ToggleButton value="kawaii">kawaii</ToggleButton>
                        <ToggleButton value="openedSmile">openedSmile</ToggleButton>
                        <ToggleButton value="openSad">openSad</ToggleButton>
                        <ToggleButton value="teethSmile">teethSmile</ToggleButton>
                        <ToggleButton value="unimpressed">unimpressed</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            )}
        </Box>
    );
};

export default AvatarEditor;
