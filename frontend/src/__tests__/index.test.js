import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../store';
import Home from '../pages/index';

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

describe('Home Page', () => {
  it('renders the home page', () => {
    render(
      <Provider store={store}>
        <Home />
      </Provider>,
    );

    expect(screen.getByText('SoloCorpTax')).toBeInTheDocument();
  });
});
