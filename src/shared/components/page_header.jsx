import Back_Arrow_Button from './back_arrow_button';

export default function Page_Header({ title, back_to = '/game' }) {
  return (
    <div style={{
      flexShrink: 0, height: '80px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', left: '16px' }}>
        <Back_Arrow_Button to={back_to} />
      </div>
      <h1 style={{ color: '#facc15', margin: 0, fontSize: '28px' }}>{title}</h1>
    </div>
  );
}
