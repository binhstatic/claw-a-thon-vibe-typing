import '../../app.css';
import { mount } from 'svelte';
import Popup from './Popup.svelte';
import { setupTheme } from '../theme';

setupTheme();
mount(Popup, { target: document.getElementById('app')! });
