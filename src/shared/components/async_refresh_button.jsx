import { useState } from 'react';
import toast from 'react-hot-toast';
import Refresh_Button from './refresh_button';

// Refresh button that handles the async-action lifecycle: disables itself while
// `on_click` is in flight and surfaces success/error toasts when it settles.
//
// `on_click` should return a Promise. Pass `success_message` and `error_message`
// to customize the toasts; pass `null` (or empty string) to suppress either.
//
// All other props (size, title, style, etc.) are forwarded to the underlying
// Refresh_Button.
export default function Async_Refresh_Button({
  on_click,
  success_message = 'Reloaded.',
  error_message = 'Reload failed.',
  ...rest
}) {
  const [loading, set_loading] = useState(false);

  const handle = async () => {
    if (loading) return;
    set_loading(true);
    try {
      await on_click();
      if (success_message) toast.success(success_message);
    } catch (e) {
      if (error_message) toast.error(e?.detail || error_message);
    } finally {
      set_loading(false);
    }
  };

  return <Refresh_Button on_click={handle} disabled={loading} {...rest} />;
}
