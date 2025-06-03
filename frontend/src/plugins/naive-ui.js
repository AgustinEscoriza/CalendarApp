import {
  // Configuración base
  create,
  NConfigProvider,
  
  // Proveedores globales para mensajes y diálogos
  NMessageProvider,
  NDialogProvider,
  NNotificationProvider,
  NLoadingBarProvider,
  
  // Componentes más usados globalmente
  NButton,
  NButtonGroup,
  NInput,
  NForm,
  NFormItem,
  NCard,
  NModal,
  NDatePicker,
  NSelect,
  NGrid,
  NGridItem,
  NIcon,
  NList,
  NListItem,
  NThing,
  
  // Temas
  darkTheme,
  lightTheme
} from 'naive-ui'

// Crear la instancia de NaiveUI con los componentes más utilizados
const naive = create({
  components: [
    NConfigProvider,
    NMessageProvider,
    NDialogProvider,
    NNotificationProvider,
    NLoadingBarProvider,
    NButton,
    NButtonGroup,
    NInput,
    NForm,
    NFormItem,
    NCard,
    NModal,
    NDatePicker,
    NSelect,
    NGrid,
    NGridItem,
    NIcon,
    NList,
    NListItem,
    NThing
  ]
})

export default naive
export { darkTheme, lightTheme } 