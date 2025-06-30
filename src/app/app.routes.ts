import { Routes } from '@angular/router';
import { FormularioComponent } from './paginas/formulario/formulario.component';
import { PaginaPrincipalComponent } from './paginas/pagina-principal/pagina-principal.component';
import { BusquedaComponent } from './paginas/busqueda/busqueda.component';
import { RolesComponent } from './paginas/roles/roles.component';
import { AjustesComponent } from './paginas/ajustes/ajustes.component';

export const routes: Routes = [
    {path: '', component: PaginaPrincipalComponent},
    {path: 'formulario', component: FormularioComponent},
    {path: 'pagina-principal', component: PaginaPrincipalComponent},
    {path: 'busqueda', component: BusquedaComponent},
    {path: 'roles', component: RolesComponent},
    {path: 'ajustes', component: AjustesComponent},
    {path: '**', redirectTo:''}
];