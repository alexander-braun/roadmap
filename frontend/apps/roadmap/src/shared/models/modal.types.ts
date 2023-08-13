import { MapComponent } from '../../app/map/map.component';
import { SettingsComponent } from '../../app/map/settings/settings.component';
import { identifierToComponentMap } from '../services/modal.service';

export type ModalTypes = keyof typeof identifierToComponentMap;

export type ModalComponents = SettingsComponent;
