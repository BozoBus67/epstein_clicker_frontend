import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { render, screen, fireEvent } from '@testing-library/react';
import sessionReducer, { login } from '../store/sessionSlice';
import Confirm_Modal from './confirm_modal';

// Confirm_Modal uses useTheme(), which reads from Redux. So tests need a real
// store with a logged-in user who has a theme set (otherwise the palette is
// undefined and rendering crashes). Helper builds that fixture once per test.
function render_with_store(ui) {
  const store = configureStore({ reducer: { session: sessionReducer } });
  store.dispatch(login({ user: {
    game_data: {},
    premium_game_data: { theme: 'dark' },
  } }));
  return render(<Provider store={store}>{ui}</Provider>);
}

let on_confirm;
let on_cancel;
beforeEach(() => {
  on_confirm = vi.fn();
  on_cancel = vi.fn();
});

describe('Confirm_Modal', () => {
  it('renders the default title "Are you sure?" when no title prop is passed', () => {
    render_with_store(<Confirm_Modal on_confirm={on_confirm} on_cancel={on_cancel} />);
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('renders a custom title when provided', () => {
    render_with_store(
      <Confirm_Modal title="Buy Listing?" on_confirm={on_confirm} on_cancel={on_cancel} />
    );
    expect(screen.getByText('Buy Listing?')).toBeInTheDocument();
    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
  });

  it('renders an info paragraph when the info prop is provided', () => {
    render_with_store(
      <Confirm_Modal info="This will cost 25 tokens." on_confirm={on_confirm} on_cancel={on_cancel} />
    );
    expect(screen.getByText('This will cost 25 tokens.')).toBeInTheDocument();
  });

  it('clicking Yes calls on_confirm', () => {
    render_with_store(<Confirm_Modal on_confirm={on_confirm} on_cancel={on_cancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'Yes' }));
    expect(on_confirm).toHaveBeenCalledTimes(1);
    expect(on_cancel).not.toHaveBeenCalled();
  });

  it('clicking No calls on_cancel', () => {
    render_with_store(<Confirm_Modal on_confirm={on_confirm} on_cancel={on_cancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'No' }));
    expect(on_cancel).toHaveBeenCalledTimes(1);
    expect(on_confirm).not.toHaveBeenCalled();
  });

  it('respects custom yes_label and no_label', () => {
    render_with_store(
      <Confirm_Modal
        yes_label="Confirm"
        no_label="Cancel"
        on_confirm={on_confirm}
        on_cancel={on_cancel}
      />
    );
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('disables both buttons and shows "..." when loading', () => {
    render_with_store(
      <Confirm_Modal on_confirm={on_confirm} on_cancel={on_cancel} loading />
    );
    const yes = screen.getByRole('button', { name: '...' });
    const no = screen.getByRole('button', { name: 'No' });
    expect(yes).toBeDisabled();
    expect(no).toBeDisabled();
  });

  it('clicking Yes while loading does nothing (button is disabled)', () => {
    render_with_store(
      <Confirm_Modal on_confirm={on_confirm} on_cancel={on_cancel} loading />
    );
    fireEvent.click(screen.getByRole('button', { name: '...' }));
    expect(on_confirm).not.toHaveBeenCalled();
  });
});
