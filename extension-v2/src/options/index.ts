import '../../app.css';
import { mount } from 'svelte';
import Options from './Options.svelte';
import { setupTheme } from '../theme';

setupTheme();
mount(Options, { target: document.getElementById('app')! });
