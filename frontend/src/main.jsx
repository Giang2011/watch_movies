import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from '@features/auth';
import '@assets/styles/global.css';
import '@assets/styles/animations.css';
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<BrowserRouter>
			<AuthProvider>
				<App />
			</AuthProvider>
		</BrowserRouter>
	</StrictMode>
);
