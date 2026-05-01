import Cookie_Click_Panel from './cookie_click_panel';
import Ads_Panel from './ads_panel';
import Buildings_Panel from './buildings_panel';

export default function Main_Body() {
  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <Cookie_Click_Panel />
      <Ads_Panel />
      <Buildings_Panel />
    </div>
  );
}
