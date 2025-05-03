import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AvatarEditor from './AvatarEditor';
import '@testing-library/jest-dom';

describe('AvatarEditor', () => {
    let mockSetAvatarOptions;

    beforeEach(() => {
        mockSetAvatarOptions = jest.fn();
    });

    test('Test 1: renderiza el avatar con la URL correcta', () => {
        const avatarOptions = {
            hairColor: '3a1a00',
            eyes: 'cheery',
            hair: 'shortHair',
            mouth: 'teethSmile',
            skinColor: 'efcc9f',
        };

        render(<AvatarEditor avatarOptions={avatarOptions} setAvatarOptions={mockSetAvatarOptions} />);

        // Verificamos que la imagen con el avatar cargue correctamente
        const avatarImage = screen.getByAltText('Avatar');
        expect(avatarImage).toBeInTheDocument();
        expect(avatarImage).toHaveAttribute('src', expect.stringContaining('https://api.dicebear.com/9.x/big-smile/svg'));
    });

    test('Test 2: cambia la categoría activa al hacer clic en los botones', () => {
        const avatarOptions = {
            hairColor: '3a1a00',
            eyes: 'cheery',
            hair: 'shortHair',
            mouth: 'teethSmile',
            skinColor: 'efcc9f',
        };

        render(<AvatarEditor avatarOptions={avatarOptions} setAvatarOptions={mockSetAvatarOptions} />);

        const skinButton = screen.getByLabelText('skin');
        const hairButton = screen.getByLabelText('hair');

        // Inicialmente, la categoría activa debe ser 'skin'
        expect(skinButton).toHaveClass('MuiIconButton-colorPrimary');
        expect(hairButton).not.toHaveClass('MuiIconButton-colorPrimary');

        fireEvent.click(hairButton);

        // Verificamos que la categoría activa cambie a 'hair'
        expect(hairButton).toHaveClass('MuiIconButton-colorPrimary');
        expect(skinButton).not.toHaveClass('MuiIconButton-colorPrimary');
    });

    test('Test 3: cambia el valor de skinColor correctamente', () => {
        const avatarOptions = {
            hairColor: '3a1a00',
            eyes: 'cheery',
            hair: 'shortHair',
            mouth: 'teethSmile',
            skinColor: 'efcc9f',
        };

        render(<AvatarEditor avatarOptions={avatarOptions} setAvatarOptions={mockSetAvatarOptions} />);

        const deepBrownButton = screen.getByText('Deep Brown');

        // Hacemos clic en el botón de color de piel 'Deep Brown'
        fireEvent.click(deepBrownButton);

        // Verificamos que la función setAvatarOptions se haya llamado con el valor correcto
        expect(mockSetAvatarOptions).toHaveBeenCalledTimes(1);
        const updateFn = mockSetAvatarOptions.mock.calls[0][0];
        expect(typeof updateFn).toBe('function');

        // Simulamos el estado anterior para ejecutar la función y ver el nuevo estado
        const previousState = avatarOptions;
        const newState = updateFn(previousState);

        // Validamos que el nuevo estado tenga el color de piel actualizado
        expect(newState).toEqual(expect.objectContaining({
            skinColor: '643d19',
        }));

    });

});

describe('AvatarEditor2', () => {
  const defaultAvatarOptions = {
    hairColor: '3a1a00',
    eyes: 'normal',
    hair: 'shortHair',
    mouth: 'kawaii',
    skinColor: 'f5d7b1',
  };

  let setAvatarOptionsMock;

  beforeEach(() => {
    setAvatarOptionsMock = jest.fn();
    render(<AvatarEditor avatarOptions={defaultAvatarOptions} setAvatarOptions={setAvatarOptionsMock} />);
  });

  test('renders avatar image', () => {
    const img = screen.getByAltText('Avatar');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', expect.stringContaining('https://api.dicebear.com'));
  });

  test('renders category buttons and switches between them', () => {
    const eyesButton = screen.getByLabelText('eyes');
    fireEvent.click(eyesButton);
    expect(screen.getByText('Select Eye Style')).toBeInTheDocument();
  });

  test('calls setAvatarOptions when selecting a hair color', () => {
    fireEvent.click(screen.getByLabelText('hair'));
    const blueHairButton = screen.getByRole('button', { name: /Blue/i });
    fireEvent.click(blueHairButton);

    expect(setAvatarOptionsMock).toHaveBeenCalledTimes(1);
    const updateFn = setAvatarOptionsMock.mock.calls[0][0];
    const updated = updateFn(defaultAvatarOptions);

    expect(updated).toEqual(expect.objectContaining({
      hairColor: '605de4',
    }));
  });

  test('calls setAvatarOptions when selecting an eye style', () => {
    fireEvent.click(screen.getByLabelText('eyes'));
    fireEvent.click(screen.getByRole('button', { name: /cheery/i }));

    expect(setAvatarOptionsMock).toHaveBeenCalledTimes(1);
    const updateFn = setAvatarOptionsMock.mock.calls[0][0];
    const updated = updateFn(defaultAvatarOptions);

    expect(updated).toEqual(expect.objectContaining({
      eyes: 'cheery',
    }));
  });
});
