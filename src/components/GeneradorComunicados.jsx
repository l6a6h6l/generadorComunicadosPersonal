import React, { useState, useEffect } from 'react';
import { Terminal, AlertTriangle, Clock, CheckCircle, RefreshCw, Copy, Trash2, Plus, Minus, User, Lock, Eye, EyeOff, Shield, Activity, Zap, Search } from 'lucide-react';

const USUARIOS_VALIDOS = [
  { usuario: 'fractalia', password: 'fractalia4ever' }
];

const SERVICIOS_TRANSACCIONALES = [
  { id: 'datafast-visa-mc', nombre: 'DATAFAST VISA-MC', descripcion: 'Transacciones locales Visa (débito/crédito) y MasterCard (crédito) en red propia', categoria: 'datafast', emoji: '💳' },
  { id: 'datafast-diners-dc', nombre: 'DATAFAST DINERS-DC', descripcion: 'Transacciones locales Diners (débito/crédito) y Discover (crédito) en red propia', categoria: 'datafast', emoji: '💳' },
  { id: 'banred-pago-tc', nombre: 'BANRED (PAGO TC)', descripcion: 'Transacciones entre bancos asociados BANRED: tarjetas de crédito, cuentas corrientes y ahorro', categoria: 'banred', emoji: '🏦' },
  { id: 'banred-base24', nombre: 'BANRED BASE 24', descripcion: 'Transacciones tarjetas de débito Banco Pichincha y bancos asociados BANRED', categoria: 'banred', emoji: '🏧' },
  { id: 'banred-base25', nombre: 'BANRED BASE 25 (ATM)', descripcion: 'Transacciones ATM tarjetas de crédito Banco Pichincha y bancos asociados BANRED', categoria: 'banred', emoji: '🏧' },
  { id: 'usp-atalla', nombre: 'USP ATALLA', descripcion: 'Validación de tarjetas propias de débito y crédito BANCO PICHINCHA', categoria: 'validacion', emoji: '🔐' },
  { id: 'efectivo-express', nombre: 'EFECTIVO EXPRESS', descripcion: 'Avances de efectivo por ventanilla Banco Pichincha', categoria: 'efectivo', emoji: '💵' },
  { id: 'diners-internacional-1', nombre: 'DINERS INTERNACIONAL 1', descripcion: 'Transacciones crédito Diners/Discover: tarjetas propias en red ajena y ajenas en red propia', categoria: 'internacional', emoji: '🌍' },
  { id: 'diners-internacional-2', nombre: 'DINERS INTERNACIONAL 2', descripcion: 'Transacciones crédito Diners/Discover: tarjetas propias en red ajena y ajenas en red propia', categoria: 'internacional', emoji: '🌎' },
  { id: 'pulse-discover', nombre: 'PULSE/DISCOVER FS', descripcion: 'Transacciones tarjetas ajenas Diners y Discover en cajeros autorizados', categoria: 'internacional', emoji: '💎' },
  { id: 'llaves-dci', nombre: 'LLAVES DCI', descripcion: 'Intercambio de llaves con franquicias DCI/Discover', categoria: 'seguridad', emoji: '🔑' },
  { id: 'visa-int-emision', nombre: 'VISA INT. EMISIÓN', descripcion: 'Transacciones débito/crédito tarjetas propias en red ajena', categoria: 'internacional', emoji: '✈️' },
  { id: 'visa-int-adquirencia', nombre: 'VISA INT. ADQUIRENCIA', descripcion: 'Transacciones crédito tarjetas ajenas en red propia', categoria: 'internacional', emoji: '🛬' },
  { id: 'mastercard-mci', nombre: 'MASTERCARD MCI', descripcion: 'Transacciones crédito tarjetas propias en red ajena', categoria: 'internacional', emoji: '🌐' },
  { id: 'mastercard-mds', nombre: 'MASTERCARD MDS', descripcion: 'Transacciones crédito tarjetas ajenas en red propia', categoria: 'internacional', emoji: '🌏' },
  { id: 'broker', nombre: 'BROKER', descripcion: 'Avances de efectivo en cajeros ATM sin tarjeta de crédito', categoria: 'efectivo', emoji: '🤝' },
  { id: 'jardin-azuayo', nombre: 'JARDÍN AZUAYO', descripcion: 'Transacciones débito Visa de Cooperativa Jardín Azuayo', categoria: 'cooperativas', emoji: '🌱' },
  { id: 'dock', nombre: 'DOCK (IMPLEMENTANDO)', descripcion: 'Transacciones débito Banco Diners Club del Ecuador', categoria: 'implementacion', emoji: '🚧' },
  { id: 'bpc-bp', nombre: 'BPC-BP', descripcion: 'Transacciones tarjeta prepago de transporte Banco Pichincha', categoria: 'prepago', emoji: '🚌' }
];

const OPCIONES_ENCOLAMIENTO = [
  'Variable General',
  'OTP General',
  'SMS Masivo',
  'Notificaciones Push',
  'Validaciones KYC'
];

const formatearFecha = (fechaISO) => {
  if (!fechaISO) return "";
  const [year, month, day] = fechaISO.split('-');
  return `${day}/${month}/${year}`;
};

const calcularDuracion = (fechaInicio, horaInicio, fechaFin, horaFin) => {
  try {
    if (!fechaInicio || !horaInicio || !fechaFin || !horaFin) return '00:00:00';
    const inicio = new Date(`${fechaInicio}T${horaInicio}`);
    const fin = new Date(`${fechaFin}T${horaFin}`);
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) return '00:00:00';
    const diferencia = fin.getTime() - inicio.getTime();
    if (diferencia < 0) return 'Error';
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
  } catch (error) {
    return '00:00:00';
  }
};

export default function GeneradorComunicados() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ usuario: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [tipo, setTipo] = useState('evento-inicio');
  const [modoBLU, setModoBLU] = useState(false);
  const [tipoBLU, setTipoBLU] = useState('aplicacion');
  const [multiplesAlertamientos, setMultiplesAlertamientos] = useState(false);
  const [periodosAlertamiento, setPeriodosAlertamiento] = useState([
    { fechaInicio: '', horaInicio: '', fechaFin: '', horaFin: '', duracion: '00:00:00' }
  ]);
  const [multiplesServicios, setMultiplesServicios] = useState(false);
  const [serviciosAlertados, setServiciosAlertados] = useState([
    { nombre: '', fechaInicio: '', horaInicio: '', fechaFin: '', horaFin: '', duracion: '00:00:00' }
  ]);
  const [multiplesEncolamientos, setMultiplesEncolamientos] = useState(false);
  const [serviciosEncolamiento, setServiciosEncolamiento] = useState([
    { tipo: 'Variable General', tipoCustom: '', fechaInicio: '', horaInicio: '', fechaFin: '', horaFin: '', duracion: '00:00:00', encolados: '' }
  ]);
  const [formData, setFormData] = useState({
    descripcion: '',
    impacto: '',
    escaladoA: '',
    motivo: '',
    impactoMant: '',
    ejecutor: '',
    fechaInicio: '',
    horaInicio: '',
    estadoInicio: 'En revisión',
    acciones: '',
    accionesEjecutadas: '',
    accionesEnCurso: '',
    fechaInicioFin: '',
    horaInicioFin: '',
    fechaFin: '',
    horaFin: '',
    duracionCalculada: '00:00:00',
    estadoFin: 'Recuperado',
    nota: ''
  });
  const [resultado, setResultado] = useState('');
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [alertaMensaje, setAlertaMensaje] = useState('');
  const [tiempoAbierto, setTiempoAbierto] = useState(Date.now());
  const [mostrarActualizacion, setMostrarActualizacion] = useState(false);
  const [mostrarConfirmacionDuracion, setMostrarConfirmacionDuracion] = useState(false);
  const [noPreguntar, setNoPreguntar] = useState(false);
  const [errorFechaFin, setErrorFechaFin] = useState('');
  const [mostrarErrorFecha, setMostrarErrorFecha] = useState(false);
  const [sugerenciasFecha, setSugerenciasFecha] = useState([]);
  const [autoLimpiarEscalado, setAutoLimpiarEscalado] = useState(true);
  const [ultimoEscalado, setUltimoEscalado] = useState('');
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [busquedaServicio, setBusquedaServicio] = useState('');

  useEffect(() => {
    establecerFechaHoraActual();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const horasAbierto = (Date.now() - tiempoAbierto) / (1000 * 60 * 60);
      if (!noPreguntar && horasAbierto >= 1 && horasAbierto % 1 < 0.017) {
        setMostrarActualizacion(true);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [tiempoAbierto, noPreguntar]);

  useEffect(() => {
    if (!formData.fechaInicioFin || !formData.horaInicioFin || !formData.fechaFin || !formData.horaFin) return;
    const duracion = calcularDuracion(formData.fechaInicioFin, formData.horaInicioFin, formData.fechaFin, formData.horaFin);
    setFormData(prev => ({ ...prev, duracionCalculada: duracion }));
  }, [formData.fechaInicioFin, formData.horaInicioFin, formData.fechaFin, formData.horaFin]);

  useEffect(() => {
    setFormData(prev => {
      let estadoInicio = prev.estadoInicio;
      let estadoFin = prev.estadoFin;
      if (tipo === 'evento-inicio' || tipo === 'incidente-inicio') estadoInicio = 'En revisión';
      else if (tipo === 'evento-fin' || tipo === 'incidente-fin') estadoFin = 'Recuperado';
      else if (tipo === 'mantenimiento-inicio') estadoInicio = 'En curso';
      else if (tipo === 'mantenimiento-fin') estadoFin = 'Finalizado';
      return { ...prev, estadoInicio, estadoFin };
    });
  }, [tipo]);

  const handleLogin = () => {
    const usuarioValido = USUARIOS_VALIDOS.find(
      user => user.usuario === loginForm.usuario && user.password === loginForm.password
    );
    if (usuarioValido) {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Credenciales incorrectas');
      setTimeout(() => setLoginError(''), 3000);
    }
  };

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginForm({ usuario: '', password: '' });
  };

  const toggleServicio = (servicio) => {
    setServiciosSeleccionados(prev => {
      const existe = prev.find(s => s.id === servicio.id);
      if (existe) {
        return prev.filter(s => s.id !== servicio.id);
      } else {
        return [...prev, servicio];
      }
    });
  };

  const isServicioSeleccionado = (servicioId) => {
    return serviciosSeleccionados.some(s => s.id === servicioId);
  };

  useEffect(() => {
    if (serviciosSeleccionados.length === 0) {
      setMultiplesServicios(false);
      return;
    }
    
    let nuevaDescripcion = '';
    if (serviciosSeleccionados.length === 1) {
      nuevaDescripcion = `Indisponibilidad ${serviciosSeleccionados[0].nombre}`;
    } else {
      const nombresServicios = serviciosSeleccionados.map(s => s.nombre).join(', ');
      nuevaDescripcion = `Indisponibilidad de varios servicios transaccionales (${nombresServicios})`;
    }
    
    const nuevosImpactos = serviciosSeleccionados.map(s => s.descripcion).join('\n');
    
    setFormData(prev => ({
      ...prev,
      descripcion: nuevaDescripcion,
      impacto: nuevosImpactos
    }));

    if (serviciosSeleccionados.length > 1) {
      setMultiplesServicios(true);
      
      const hoy = new Date();
      const fechaActual = hoy.toISOString().split('T')[0];
      const horaActual = hoy.toTimeString().split(' ')[0];
      
      const nuevosServiciosAlertados = serviciosSeleccionados.map(servicio => ({
        nombre: servicio.nombre,
        fechaInicio: fechaActual,
        horaInicio: horaActual,
        fechaFin: fechaActual,
        horaFin: horaActual,
        duracion: '00:00:00'
      }));
      
      setServiciosAlertados(nuevosServiciosAlertados);
    } else {
      setMultiplesServicios(false);
      const hoy = new Date();
      const fechaActual = hoy.toISOString().split('T')[0];
      const horaActual = hoy.toTimeString().split(' ')[0];
      setServiciosAlertados([{
        nombre: '',
        fechaInicio: fechaActual,
        horaInicio: horaActual,
        fechaFin: fechaActual,
        horaFin: horaActual,
        duracion: '00:00:00'
      }]);
    }
  }, [serviciosSeleccionados]);

  const calcularTiempoAbierto = () => {
    const diferencia = Date.now() - tiempoAbierto;
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    return { horas, minutos, total: diferencia / (1000 * 60 * 60) };
  };

  const getEstadoSemaforo = () => {
    const { total } = calcularTiempoAbierto();
    if (total < 1) return { estado: 'SINCRONIZADO', clase: 'bg-green-500', texto: 'text-green-400', borde: 'border-green-500' };
    if (total < 4) return { estado: 'REVISAR SINCRONIZACIÓN', clase: 'bg-yellow-500', texto: 'text-yellow-400', borde: 'border-yellow-500' };
    return { estado: 'FUERA DE SINCRONÍA', clase: 'bg-red-500', texto: 'text-red-400', borde: 'border-red-500' };
  };

  const actualizarFechasAhora = () => {
    establecerFechaHoraActual();
    setTiempoAbierto(Date.now());
    setMostrarActualizacion(false);
    setAlertaMensaje('Fechas sincronizadas correctamente');
    setMostrarAlerta(true);
    setTimeout(() => setMostrarAlerta(false), 3000);
  };

  const establecerFechaHoraActual = () => {
    const hoy = new Date();
    const fechaActual = hoy.toISOString().split('T')[0];
    const horaActual = hoy.toTimeString().split(' ')[0];
    
    setFormData(prev => ({
      ...prev,
      fechaInicio: fechaActual,
      horaInicio: horaActual,
      fechaInicioFin: fechaActual,
      horaInicioFin: horaActual,
      fechaFin: fechaActual,
      horaFin: horaActual
    }));
    
    setPeriodosAlertamiento([{
      fechaInicio: fechaActual,
      horaInicio: horaActual,
      fechaFin: fechaActual,
      horaFin: horaActual,
      duracion: '00:00:00'
    }]);
    
    setServiciosAlertados([{
      nombre: '',
      fechaInicio: fechaActual,
      horaInicio: horaActual,
      fechaFin: fechaActual,
      horaFin: horaActual,
      duracion: '00:00:00'
    }]);
    
    setServiciosEncolamiento([{
      tipo: 'Variable General',
      tipoCustom: '',
      fechaInicio: fechaActual,
      horaInicio: horaActual,
      fechaFin: fechaActual,
      horaFin: horaActual,
      duracion: '00:00:00',
      encolados: ''
    }]);
  };

  const limpiarCampos = () => {
    establecerFechaHoraActual();
    setFormData(prev => ({
      ...prev,
      descripcion: '',
      impacto: '',
      escaladoA: '',
      motivo: '',
      impactoMant: '',
      ejecutor: '',
      acciones: '',
      accionesEjecutadas: '',
      accionesEnCurso: '',
      nota: ''
    }));
    setMultiplesAlertamientos(false);
    setMultiplesServicios(false);
    setMultiplesEncolamientos(false);
    setMostrarConfirmacionDuracion(false);
    setErrorFechaFin('');
    setMostrarErrorFecha(false);
    setSugerenciasFecha([]);
    setServiciosSeleccionados([]);
    setAlertaMensaje('Campos limpiados correctamente');
    setMostrarAlerta(true);
    setTimeout(() => setMostrarAlerta(false), 3000);
  };

  const agregarServicioAlertado = () => {
    const hoy = new Date();
    const fechaActual = hoy.toISOString().split('T')[0];
    const horaActual = hoy.toTimeString().split(' ')[0];
    setServiciosAlertados(prev => [...prev, {
      nombre: '',
      fechaInicio: fechaActual,
      horaInicio: horaActual,
      fechaFin: fechaActual,
      horaFin: horaActual,
      duracion: '00:00:00'
    }]);
  };

  const eliminarServicioAlertado = (index) => {
    if (serviciosAlertados.length > 1) {
      setServiciosAlertados(prev => prev.filter((_, i) => i !== index));
    }
  };

  const actualizarServicioAlertado = (index, campo, valor) => {
    setServiciosAlertados(prev => 
      prev.map((servicio, i) => {
        if (i === index) {
          const nuevoServicio = { ...servicio, [campo]: valor };
          if (nuevoServicio.fechaInicio && nuevoServicio.horaInicio && nuevoServicio.fechaFin && nuevoServicio.horaFin) {
            nuevoServicio.duracion = calcularDuracion(nuevoServicio.fechaInicio, nuevoServicio.horaInicio, nuevoServicio.fechaFin, nuevoServicio.horaFin);
          }
          return nuevoServicio;
        }
        return servicio;
      })
    );
  };

  const agregarPeriodo = () => {
    const hoy = new Date();
    const fechaActual = hoy.toISOString().split('T')[0];
    const horaActual = hoy.toTimeString().split(' ')[0];
    setPeriodosAlertamiento(prev => [...prev, {
      fechaInicio: fechaActual,
      horaInicio: horaActual,
      fechaFin: fechaActual,
      horaFin: horaActual,
      duracion: '00:00:00'
    }]);
  };

  const eliminarPeriodo = (index) => {
    if (periodosAlertamiento.length > 1) {
      setPeriodosAlertamiento(prev => prev.filter((_, i) => i !== index));
    }
  };

  const agregarServicioEncolamiento = () => {
    const hoy = new Date();
    const fechaActual = hoy.toISOString().split('T')[0];
    const horaActual = hoy.toTimeString().split(' ')[0];
    setServiciosEncolamiento(prev => [...prev, {
      tipo: 'Variable General',
      tipoCustom: '',
      fechaInicio: fechaActual,
      horaInicio: horaActual,
      fechaFin: fechaActual,
      horaFin: horaActual,
      duracion: '00:00:00',
      encolados: ''
    }]);
  };

  const eliminarServicioEncolamiento = (index) => {
    if (serviciosEncolamiento.length > 1) {
      setServiciosEncolamiento(prev => prev.filter((_, i) => i !== index));
    }
  };

  const actualizarServicioEncolamiento = (index, campo, valor) => {
    setServiciosEncolamiento(prev => 
      prev.map((servicio, i) => {
        if (i === index) {
          const nuevoServicio = { ...servicio, [campo]: valor };
          if (nuevoServicio.fechaInicio && nuevoServicio.horaInicio && nuevoServicio.fechaFin && nuevoServicio.horaFin) {
            nuevoServicio.duracion = calcularDuracion(nuevoServicio.fechaInicio, nuevoServicio.horaInicio, nuevoServicio.fechaFin, nuevoServicio.horaFin);
          }
          return nuevoServicio;
        }
        return servicio;
      })
    );
  };

  const actualizarPeriodo = (index, campo, valor) => {
    setPeriodosAlertamiento(prev => 
      prev.map((periodo, i) => {
        if (i === index) {
          const nuevoPeriodo = { ...periodo, [campo]: valor };
          if (nuevoPeriodo.fechaInicio && nuevoPeriodo.horaInicio && nuevoPeriodo.fechaFin && nuevoPeriodo.horaFin) {
            nuevoPeriodo.duracion = calcularDuracion(nuevoPeriodo.fechaInicio, nuevoPeriodo.horaInicio, nuevoPeriodo.fechaFin, nuevoPeriodo.horaFin);
          }
          return nuevoPeriodo;
        }
        return periodo;
      })
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const seleccionarTipo = (nuevoTipo) => {
    const tipoAnterior = tipo;
    setTipo(nuevoTipo);
    
    if ((tipoAnterior.endsWith('-inicio') || tipoAnterior.endsWith('-avance') || tipoAnterior.endsWith('-seguimiento')) && nuevoTipo.endsWith('-fin')) {
      const hoy = new Date();
      const fechaActual = hoy.toISOString().split('T')[0];
      const horaActual = hoy.toTimeString().split(' ')[0];
      
      setFormData(prev => ({
        ...prev,
        fechaInicioFin: prev.fechaInicio,
        horaInicioFin: prev.horaInicio,
        fechaFin: fechaActual,
        horaFin: horaActual
      }));
      
      setAlertaMensaje('Fechas autocompletadas desde el inicio');
      setMostrarAlerta(true);
      setTimeout(() => setMostrarAlerta(false), 4000);
    }
  };

  const validarFechasFin = () => {
    const { fechaInicioFin, horaInicioFin, fechaFin, horaFin } = formData;
    
    if (!fechaInicioFin || !horaInicioFin || !fechaFin || !horaFin) {
      setErrorFechaFin('');
      return true;
    }

    try {
      const inicio = new Date(`${fechaInicioFin}T${horaInicioFin}`);
      const fin = new Date(`${fechaFin}T${horaFin}`);
      
      if (fin < inicio) {
        setErrorFechaFin(`Error: La hora de fin es anterior a la hora de inicio`);
        const hoy = new Date();
        const fechaActual = hoy.toISOString().split('T')[0];
        const horaActual = hoy.toTimeString().split(' ')[0];
        
        setSugerenciasFecha([
          { texto: `Usar hora actual: ${formatearFecha(fechaActual)} ${horaActual}`, fecha: fechaActual, hora: horaActual }
        ]);
        setMostrarErrorFecha(true);
        return false;
      }
      
      setErrorFechaFin('');
      setSugerenciasFecha([]);
      setMostrarErrorFecha(false);
      return true;
    } catch (error) {
      setErrorFechaFin('Error al procesar las fechas');
      return false;
    }
  };

  const aplicarSugerenciaFecha = (fecha, hora) => {
    setFormData(prev => ({ ...prev, fechaFin: fecha, horaFin: hora }));
    setErrorFechaFin('');
    setSugerenciasFecha([]);
    setMostrarErrorFecha(false);
    setAlertaMensaje(`Fecha corregida correctamente`);
    setMostrarAlerta(true);
    setTimeout(() => setMostrarAlerta(false), 3000);
  };

  const calcularDuracionTotal = () => {
    if (!multiplesAlertamientos || periodosAlertamiento.length === 0) return formData.duracionCalculada;
    let totalSegundos = 0;
    periodosAlertamiento.forEach(periodo => {
      if (periodo.duracion !== '00:00:00' && periodo.duracion !== 'Error') {
        const [horas, minutos, segundos] = periodo.duracion.split(':').map(Number);
        totalSegundos += (horas * 3600) + (minutos * 60) + segundos;
      }
    });
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
  };

  const formatearServiciosAlertados = () => {
    if (!multiplesServicios || serviciosAlertados.length === 0) return '';
    
    let resultado = 'Alertamientos:';
    serviciosAlertados.forEach((servicio) => {
      if (servicio.nombre && servicio.nombre.trim() !== '') {
        resultado += `\n        Servicio: ${servicio.nombre}`;
        const fechaInicioFormateada = formatearFecha(servicio.fechaInicio);
        resultado += `\n        Inicio: ${fechaInicioFormateada} - ${servicio.horaInicio}`;
        
        if (servicio.fechaFin && servicio.horaFin && (servicio.fechaFin !== servicio.fechaInicio || servicio.horaFin !== servicio.horaInicio)) {
          const fechaFinFormateada = formatearFecha(servicio.fechaFin);
          resultado += `\n        Fin: ${fechaFinFormateada} - ${servicio.horaFin}`;
          resultado += `\n        Duración: ${servicio.duracion}`;
        }
        resultado += `\n`;
      }
    });
    return resultado;
  };

  const formatearPeriodosMultiples = () => {
    if (!multiplesAlertamientos || periodosAlertamiento.length === 0) {
      const fechaInicioFormateada = formatearFecha(formData.fechaInicioFin);
      const fechaFinFormateada = formatearFecha(formData.fechaFin);
      return `Inicio: ${fechaInicioFormateada} - ${formData.horaInicioFin}\nFin: ${fechaFinFormateada} - ${formData.horaFin}\nDuración: ${formData.duracionCalculada}`;
    }
    let resultado = `Duración Total: ${calcularDuracionTotal()}\nPeríodos de Alertamiento:`;
    periodosAlertamiento.forEach((periodo, index) => {
      const fechaInicioFormateada = formatearFecha(periodo.fechaInicio);
      const fechaFinFormateada = formatearFecha(periodo.fechaFin);
      resultado += `\n        Período ${index + 1}:`;
      resultado += `\n        Inicio: ${fechaInicioFormateada} - ${periodo.horaInicio}`;
      resultado += `\n        Fin: ${fechaFinFormateada} - ${periodo.horaFin}`;
      resultado += `\n        Duración: ${periodo.duracion}`;
      if (index < periodosAlertamiento.length - 1) resultado += `\n`;
    });
    return resultado;
  };

  const formatearImpacto = (impacto, valorPorDefecto) => {
    const impactoVal = impacto || valorPorDefecto;
    const lineas = impactoVal.split('\n').filter(linea => linea.trim() !== '');
    if (lineas.length <= 1) return `Impacto: ${impactoVal}`;
    let resultado = "Impacto:";
    lineas.forEach(linea => {
      const lineaLimpia = linea.trim();
      if (lineaLimpia) {
        resultado += `\n        • ${lineaLimpia}`;
      }
    });
    return resultado;
  };

  const formatearNotaEncolamientos = () => {
    if (!multiplesEncolamientos || serviciosEncolamiento.length === 0) return '';
    let resultado = 'Encolamientos por servicio:';
    serviciosEncolamiento.forEach(servicio => {
      if (servicio.encolados && servicio.encolados.trim() !== '') {
        const tipoServicio = servicio.tipo === 'Otro' ? servicio.tipoCustom : servicio.tipo;
        resultado += `\n        • ${tipoServicio}: ${servicio.encolados}`;
      }
    });
    return resultado;
  };

  const generarMensaje = () => {
    if (tipo.endsWith('-fin') && !validarFechasFin()) {
      return;
    }
    
    if (tipo.endsWith('-fin')) {
      let duracionAValidar = '';
      
      if (multiplesAlertamientos && periodosAlertamiento.length > 0) {
        duracionAValidar = calcularDuracionTotal();
      } else {
        duracionAValidar = formData.duracionCalculada;
      }
      
      const [horas, minutos, segundos] = duracionAValidar.split(':').map(Number);
      const duracionEnHoras = horas + (minutos / 60) + (segundos / 3600);
      
      if (duracionEnHoras > 4) {
        setMostrarConfirmacionDuracion(true);
        return;
      }
    }
    
    generarMensajeInterno();
  };

  const generarMensajeInterno = () => {
    let mensaje = "";
    
    if (formData.escaladoA && formData.escaladoA.trim() !== '') {
      setUltimoEscalado(formData.escaladoA);
    }
    
    const getTitulo = () => {
      if (!modoBLU) {
        if (tipo.startsWith('evento-')) return 'GESTIÓN EVENTO';
        if (tipo.startsWith('incidente-')) return 'GESTIÓN INCIDENTE';
        if (tipo.startsWith('mantenimiento-')) return tipo.includes('inicio') ? '⚠️ MANTENIMIENTO' : '✅ MANTENIMIENTO';
      }
      if (tipo.startsWith('evento-')) {
        if (tipoBLU === 'bian') return 'GESTIÓN EVENTO BIAN';
        return 'GESTIÓN EVENTO BLU 2.0';
      }
      if (tipo.startsWith('incidente-')) return 'GESTIÓN INCIDENTE';
      if (tipo.startsWith('mantenimiento-')) return tipo.includes('inicio') ? '⚠️ MANTENIMIENTO' : '✅ MANTENIMIENTO';
    };
    
    if (tipo === 'evento-inicio') {
      const descripcionVal = formData.descripcion || (modoBLU ? "Alertamiento [cluster/namespace]" : "DESCRIPCION DEL INCIDENTE");
      const estadoVal = formData.estadoInicio || "En revisión";
      const fechaFormateada = formatearFecha(formData.fechaInicio);
      const impactoFormateado = formatearImpacto(formData.impacto, "Impacto servicio / usuarios");
      
      mensaje = `${getTitulo()}\n🟡 ${estadoVal}\n\nDescripción: ${descripcionVal}\n${impactoFormateado}`;
      
      if (formData.escaladoA && formData.escaladoA.trim() !== '') {
        mensaje += `\nEscalado a: ${formData.escaladoA}`;
      }
      
      const serviciosInfo = formatearServiciosAlertados();
      if (serviciosInfo) {
        mensaje += `\n\n${serviciosInfo}`;
      } else {
        mensaje += `\nInicio: ${fechaFormateada} - ${formData.horaInicio}`;
      }
    }
    else if (tipo === 'evento-seguimiento') {
      const descripcionVal = formData.descripcion || (modoBLU ? "Alertamiento [cluster/namespace]" : "DESCRIPCION DEL INCIDENTE");
      const impactoFormateado = formatearImpacto(formData.impacto, "Impacto servicio / usuarios");
      
      mensaje = `${getTitulo()}\n🔁 Seguimiento\n\nDescripción: ${descripcionVal}`;
      mensaje += `\n${impactoFormateado}`;
      
      if (formData.escaladoA && formData.escaladoA.trim() !== '') {
        mensaje += `\nEscalado a: ${formData.escaladoA}`;
      }
      
      if (formData.acciones && formData.acciones.trim()) {
        mensaje += "\nAcciones:";
        formData.acciones.split('\n').forEach(linea => {
          const lineaLimpia = linea.trim();
          if (lineaLimpia) {
            if (lineaLimpia.includes('%%')) {
              const [accion, responsable] = lineaLimpia.split('%%').map(s => s.trim());
              mensaje += `\n        • ${accion}`;
              if (responsable) mensaje += `\n          Responsable: ${responsable}`;
            } else {
              mensaje += `\n        • ${lineaLimpia}`;
            }
          }
        });
      }
    }
    else if (tipo === 'evento-fin') {
      const descripcionVal = formData.descripcion || (modoBLU ? "Alertamiento [cluster/namespace]" : "DESCRIPCION DEL INCIDENTE");
      const estadoVal = formData.estadoFin || "Recuperado";
      const impactoFormateado = formatearImpacto(formData.impacto, "Impacto servicio / usuarios");
      
      mensaje = `${getTitulo()}\n🟢 ${estadoVal}\n\nDescripción: ${descripcionVal}\n${impactoFormateado}`;
      
      if (formData.escaladoA && formData.escaladoA.trim() !== '') {
        mensaje += `\nEscalado a: ${formData.escaladoA}`;
      }
      
      mensaje += `\n${formatearPeriodosMultiples()}`;
      
      if (formData.acciones && formData.acciones.trim()) {
        mensaje += "\nAcciones:";
        formData.acciones.split('\n').forEach(linea => {
          const lineaLimpia = linea.trim();
          if (lineaLimpia) {
            if (lineaLimpia.includes('%%')) {
              const [accion, responsable] = lineaLimpia.split('%%').map(s => s.trim());
              mensaje += `\n        • ${accion}`;
              if (responsable) mensaje += `\n          Responsable: ${responsable}`;
            } else {
              mensaje += `\n        • ${lineaLimpia}`;
            }
          }
        });
      }
    }
    else if (tipo === 'mantenimiento-inicio') {
      const motivoVal = formData.motivo || "Descripción del Mantenimiento";
      const ejecutorVal = formData.ejecutor || "Proveedor o área interna";
      const estadoVal = formData.estadoInicio || "En curso";
      const fechaFormateada = formatearFecha(formData.fechaInicio);
      const impactoFormateado = formatearImpacto(formData.impactoMant, "Impacto servicio / usuarios / clientes");
      
      mensaje = `${getTitulo()}\n\nEstado: ${estadoVal}\nMotivo: ${motivoVal}\n${impactoFormateado}\nEjecutor: ${ejecutorVal}\nInicio: ${fechaFormateada} - ${formData.horaInicio}`;
    }
    else if (tipo === 'mantenimiento-fin') {
      const motivoVal = formData.motivo || "Descripción del Mantenimiento";
      const ejecutorVal = formData.ejecutor || "Proveedor o área interna";
      const estadoVal = formData.estadoFin || "Finalizado";
      const impactoFormateado = formatearImpacto(formData.impactoMant, "Impacto servicio / usuarios / clientes");
      
      mensaje = `${getTitulo()}\n\nEstado: ${estadoVal}\nMotivo: ${motivoVal}\n${impactoFormateado}\nEjecutor: ${ejecutorVal}\n${formatearPeriodosMultiples()}`;
    }
    else if (tipo === 'incidente-inicio') {
      const descripcionVal = formData.descripcion || "DESCRIPCION DEL INCIDENTE";
      const estadoVal = formData.estadoInicio || "En revisión";
      const fechaFormateada = formatearFecha(formData.fechaInicio);
      const impactoFormateado = formatearImpacto(formData.impacto, "Impacto servicio / usuarios");
      
      mensaje = `${getTitulo()}\n🟡 ${estadoVal}\n\nDescripción: ${descripcionVal}\n${impactoFormateado}`;
      
      if (formData.escaladoA && formData.escaladoA.trim() !== '') {
        mensaje += `\nEscalado a: ${formData.escaladoA}`;
      }
      
      const serviciosInfo = formatearServiciosAlertados();
      if (serviciosInfo) {
        mensaje += `\n\n${serviciosInfo}`;
      } else {
        mensaje += `\nInicio: ${fechaFormateada} - ${formData.horaInicio}`;
      }
    }
    else if (tipo === 'incidente-avance') {
      const descripcionVal = formData.descripcion || "DESCRIPCION DEL INCIDENTE";
      const impactoFormateado = formatearImpacto(formData.impacto, "Impacto servicio / usuarios");
      
      mensaje = `${getTitulo()}\n🔁 Avance\n\nDescripción: ${descripcionVal}\n${impactoFormateado}`;
      
      if (formData.escaladoA && formData.escaladoA.trim() !== '') {
        mensaje += `\nEscalado a: ${formData.escaladoA}`;
      }
      
      if (formData.accionesEnCurso && formData.accionesEnCurso.trim()) {
        mensaje += "\nAcciones en curso:";
        formData.accionesEnCurso.split('\n').forEach(linea => {
          const lineaLimpia = linea.trim();
          if (lineaLimpia) {
            if (lineaLimpia.includes('%%')) {
              const [accion, responsable] = lineaLimpia.split('%%').map(s => s.trim());
              mensaje += `\n        • ${accion}`;
              if (responsable) mensaje += `\n          Responsable: ${responsable}`;
            } else {
              mensaje += `\n        • ${lineaLimpia}`;
            }
          }
        });
      }
      
      if (formData.accionesEjecutadas && formData.accionesEjecutadas.trim()) {
        mensaje += "\nAcciones ejecutadas:";
        formData.accionesEjecutadas.split('\n').forEach(linea => {
          const lineaLimpia = linea.trim();
          if (lineaLimpia) {
            if (lineaLimpia.includes('%%')) {
              const [accion, responsable] = lineaLimpia.split('%%').map(s => s.trim());
              mensaje += `\n        • ${accion}`;
              if (responsable) mensaje += `\n          Responsable: ${responsable}`;
            } else {
              mensaje += `\n        • ${lineaLimpia}`;
            }
          }
        });
      }
    }
    else if (tipo === 'incidente-fin') {
      const descripcionVal = formData.descripcion || "DESCRIPCION DEL INCIDENTE";
      const estadoFin = 'Recuperado';
      const impactoFormateado = formatearImpacto(formData.impacto, "Impacto servicio / usuarios");
      
      mensaje = `${getTitulo()}\n🟢 ${estadoFin}\n\nDescripción: ${descripcionVal}\n${impactoFormateado}`;
      
      if (formData.escaladoA && formData.escaladoA.trim() !== '') {
        mensaje += `\nEscalado a: ${formData.escaladoA}`;
      }
      
      mensaje += `\n${formatearPeriodosMultiples()}`;
      
      if (formData.accionesEjecutadas && formData.accionesEjecutadas.trim()) {
        mensaje += "\nAcciones ejecutadas:";
        formData.accionesEjecutadas.split('\n').forEach(linea => {
          const lineaLimpia = linea.trim();
          if (lineaLimpia) {
            if (lineaLimpia.includes('%%')) {
              const [accion, responsable] = lineaLimpia.split('%%').map(s => s.trim());
              mensaje += `\n        • ${accion}`;
              if (responsable) mensaje += `\n          Responsable: ${responsable}`;
            } else {
              mensaje += `\n        • ${lineaLimpia}`;
            }
          }
        });
      }
    }
    
    if (formData.nota || (multiplesEncolamientos && tipo.startsWith('evento-'))) {
      if (tipo.startsWith('mantenimiento-')) {
        mensaje += `\n\n📣 NOTA:\n        ${formData.nota || 'Observaciones adicionales'}`;
      } else {
        mensaje += `\n\n📣 NOTA:`;
        if (formData.nota && formData.nota.trim() !== "") {
          mensaje += `\n        ${formData.nota}`;
        }
        if (multiplesEncolamientos && tipo.startsWith('evento-')) {
          const notaEncolamientos = formatearNotaEncolamientos();
          if (notaEncolamientos) {
            if (formData.nota && formData.nota.trim() !== "") {
              mensaje += `\n        \n        ${notaEncolamientos}`;
            } else {
              mensaje += `\n        ${notaEncolamientos}`;
            }
          }
        }
        if (!formData.nota && !multiplesEncolamientos) {
          mensaje = mensaje.replace('\n\n📣 NOTA:', '');
        }
      }
    }
    
    setResultado(mensaje);
    setMostrarAlerta(false);
    
    if (autoLimpiarEscalado && (tipo.startsWith('evento-') || tipo.startsWith('incidente-'))) {
      setFormData(prev => ({ ...prev, escaladoA: '' }));
    }
  };

  const copiar = () => {
    if (!resultado) {
      alert("Por favor genere el mensaje primero");
      return;
    }
    navigator.clipboard.writeText(resultado)
      .then(() => {
        setAlertaMensaje('Mensaje copiado al portapapeles');
        setMostrarAlerta(true);
        setTimeout(() => setMostrarAlerta(false), 3000);
      })
      .catch(() => {
        alert("Error al copiar el mensaje");
      });
  };

  const serviciosFiltrados = SERVICIOS_TRANSACCIONALES.filter(servicio =>
    servicio.nombre.toLowerCase().includes(busquedaServicio.toLowerCase()) ||
    servicio.descripcion.toLowerCase().includes(busquedaServicio.toLowerCase())
  );

  const btnPrimary = "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-lg shadow-blue-900/50 transform hover:scale-105";
  const btnSecondary = "bg-gray-800/80 hover:bg-gray-700/90 backdrop-blur text-blue-300 border border-blue-500/30 px-4 py-2 rounded-lg font-semibold transition-all transform hover:scale-105";
  const btnWarning = "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-lg shadow-orange-900/50 transform hover:scale-105";
  const input = "w-full p-3 bg-black/40 backdrop-blur border border-blue-500/30 rounded-lg text-blue-100 placeholder-blue-400/50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all";
  const label = "block mb-2 text-sm font-semibold text-blue-300";
  const card = "bg-gray-900/60 backdrop-blur-xl rounded-xl p-6 border border-blue-500/20 shadow-2xl shadow-blue-900/30";

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-700/20 via-transparent to-transparent"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-700/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="w-full max-w-md bg-gray-900/90 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl shadow-blue-900/50 border border-blue-500/30 relative z-10 transform hover:scale-[1.02] transition-all duration-300">
          <div className="text-center mb-8">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-8 border-blue-600 bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-900/50"></div>
              <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="absolute left-3 w-5 h-14 bg-gradient-to-r from-blue-600 to-blue-700 rounded-l-full"></div>
                  <div className="absolute right-3 w-5 h-14 bg-gradient-to-l from-blue-600 to-blue-700 rounded-r-full"></div>
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 mb-3">
              Centro de Comando
            </h1>
            <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full mb-3"></div>
            <p className="text-blue-300 text-base font-semibold">Diners Club del Ecuador</p>
            <p className="text-blue-400/70 text-sm mt-2">Sistema de Gestión de Comunicados</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className={label + " flex items-center space-x-2"}>
                <User className="w-4 h-4" />
                <span>Usuario</span>
              </label>
              <input
                type="text"
                name="usuario"
                value={loginForm.usuario}
                onChange={handleLoginInputChange}
                className={input}
                placeholder="Ingrese su usuario"
              />
            </div>
            <div>
              <label className={label + " flex items-center space-x-2"}>
                <Lock className="w-4 h-4" />
                <span>Contraseña</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginInputChange}
                  className={input + " pr-12"}
                  placeholder="Ingrese su contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {loginError && (
              <div className="p-4 rounded-xl bg-red-900/40 border border-red-500/50 backdrop-blur animate-pulse">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <p className="text-red-300 text-sm font-medium">{loginError}</p>
                </div>
              </div>
            )}
            <button onClick={handleLogin} className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/50 transform hover:scale-[1.02] flex items-center justify-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Iniciar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950 relative">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <header className="bg-gray-900/80 backdrop-blur-xl rounded-xl p-6 mb-6 shadow-2xl border border-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 w-12 h-12 rounded-lg flex items-center justify-center shadow-lg">
                <Terminal className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                  Centro de Comando - Diners Club Ecuador
                </h1>
                <p className="text-blue-300 text-sm">Sistema de Gestión de Comunicados</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-blue-300 hover:text-blue-100 text-sm font-medium transition-all">
              Cerrar Sesión
            </button>
          </div>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${getEstadoSemaforo().borde} bg-black/40`}>
                <div className={`w-2 h-2 rounded-full ${getEstadoSemaforo().clase} animate-pulse`}></div>
                <span className={`text-xs font-semibold ${getEstadoSemaforo().texto}`}>
                  {getEstadoSemaforo().estado}
                </span>
                <span className="text-blue-400/70 text-xs">
                  ({calcularTiempoAbierto().horas}h {calcularTiempoAbierto().minutos}m)
                </span>
                <button onClick={actualizarFechasAhora} className="text-blue-400 hover:text-blue-300">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <button
              onClick={() => setModoBLU(!modoBLU)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                modoBLU 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg' 
                  : 'bg-gray-800/60 text-blue-300 border border-blue-500/30'
              }`}
            >
              {modoBLU ? '● Modo BLU 2.0 Activo' : '○ Activar Modo BLU 2.0'}
            </button>
          </div>
          
          {modoBLU && (
            <div className="mt-4 flex gap-2 flex-wrap">
              {['aplicacion', 'infraestructura', 'bian'].map(t => (
                <button
                  key={t}
                  onClick={() => setTipoBLU(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    tipoBLU === t 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg'
                      : 'bg-gray-800/60 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {t === 'aplicacion' ? '📱 Aplicación' : t === 'infraestructura' ? '🖥️ Infraestructura' : '⚠️ BIAN'}
                </button>
              ))}
            </div>
          )}
        </header>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Panel izquierdo */}
          <div className="lg:col-span-1 space-y-4">
            {/* Selector de servicios - ARRIBA */}
            {(tipo.startsWith('evento-') || tipo.startsWith('incidente-')) && (
              <div className={card}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-blue-300 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Servicios Afectados
                  </h3>
                  {serviciosSeleccionados.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-green-600/20 border border-green-500/40 rounded-md text-xs font-semibold text-green-300">
                        ✓ {serviciosSeleccionados.length}
                      </span>
                      <button 
                        onClick={() => setServiciosSeleccionados([])}
                        className="text-xs bg-red-900/40 hover:bg-red-800/60 border border-red-500/50 text-red-300 px-2 py-1 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-xs text-blue-400/70 bg-blue-900/20 border border-blue-500/30 rounded-lg p-2 mb-3">
                  💡 <strong>Auto-llenado:</strong> Click en servicios completa descripción e impacto automáticamente
                </div>
                
                <div className="relative mb-3">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
                  <input
                    type="text"
                    placeholder="Buscar servicio..."
                    value={busquedaServicio}
                    onChange={(e) => setBusquedaServicio(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-black/40 border border-blue-500/30 rounded-lg text-blue-100 text-sm placeholder-blue-400/50 focus:border-blue-400 focus:outline-none"
                  />
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2">
                  {serviciosFiltrados.map(servicio => (
                    <button
                      key={servicio.id}
                      onClick={() => toggleServicio(servicio)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all border-2 flex items-center justify-between ${
                        isServicioSeleccionado(servicio.id)
                          ? 'bg-blue-600 text-white border-blue-400 shadow-lg'
                          : 'bg-gray-800/60 text-gray-300 border-gray-700 hover:bg-gray-700 hover:border-blue-500/50'
                      }`}
                      title={servicio.descripcion}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base">{servicio.emoji}</span>
                        <span className="font-semibold">{servicio.nombre}</span>
                      </span>
                      {isServicioSeleccionado(servicio.id) && <CheckCircle className="w-4 h-4" />}
                    </button>
                  ))}
                  {serviciosFiltrados.length === 0 && (
                    <p className="text-center text-blue-400/70 text-sm py-4">No se encontraron servicios</p>
                  )}
                </div>
              </div>
            )}

            {/* Agregar solo impactos (método alternativo) */}
            {(tipo.startsWith('evento-') || tipo.startsWith('incidente-') || tipo.startsWith('mantenimiento-')) && (
              <div className={card}>
                <h3 className="text-sm font-bold text-blue-300 mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Agregar Impactos
                </h3>
                <div className="text-xs text-blue-400/70 bg-gray-900/40 border border-gray-700 rounded-lg p-2 mb-3">
                  ⚙️ <strong>Modo manual:</strong> Solo agrega impactos sin autocompletar descripción
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {SERVICIOS_TRANSACCIONALES.map(servicio => (
                    <button
                      key={servicio.id + '-impacto'}
                      onClick={() => {
                        const campoImpacto = tipo.startsWith('mantenimiento-') ? 'impactoMant' : 'impacto';
                        const impactoActual = formData[campoImpacto];
                        const nuevoImpacto = !impactoActual ? servicio.descripcion : impactoActual + '\n' + servicio.descripcion;
                        setFormData(prev => ({ ...prev, [campoImpacto]: nuevoImpacto }));
                        setAlertaMensaje(`Impacto agregado: ${servicio.nombre}`);
                        setMostrarAlerta(true);
                        setTimeout(() => setMostrarAlerta(false), 2000);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded text-xs bg-gray-900/60 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 transition-all"
                      title={servicio.descripcion}
                    >
                      {servicio.emoji} {servicio.nombre}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => {
                    const campoImpacto = tipo.startsWith('mantenimiento-') ? 'impactoMant' : 'impacto';
                    setFormData(prev => ({ ...prev, [campoImpacto]: '' }));
                    setAlertaMensaje('Impactos limpiados');
                    setMostrarAlerta(true);
                    setTimeout(() => setMostrarAlerta(false), 2000);
                  }}
                  className="w-full mt-2 text-xs bg-red-900/40 hover:bg-red-800/60 border border-red-500/50 text-red-300 px-3 py-1.5 rounded-lg transition-all"
                >
                  <Trash2 className="w-3 h-3 inline mr-1" />
                  Limpiar Impactos
                </button>
              </div>
            )}

            {/* Tipo de comunicado */}
            <div className={card}>
              <h2 className="text-base font-bold text-blue-300 mb-4">Tipo de Comunicado</h2>
              <div className="space-y-3">
                <div className="border border-blue-500/20 rounded-lg p-3 bg-black/40">
                  <h3 className="text-sm font-semibold text-blue-400 mb-2">Eventos</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {['evento-inicio', 'evento-seguimiento', 'evento-fin'].map((t, i) => (
                      <button
                        key={t}
                        className={`p-2 rounded-lg text-xs font-medium transition-all ${tipo === t ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg' : 'bg-gray-800/60 text-blue-300 border border-blue-500/30 hover:bg-gray-700/70'}`}
                        onClick={() => seleccionarTipo(t)}
                      >
                        {i === 0 ? '🟡' : i === 1 ? '🔁' : '🟢'}<br/>{i === 0 ? 'Inicio' : i === 1 ? 'Seg' : 'Fin'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border border-orange-500/20 rounded-lg p-3 bg-black/40">
                  <h3 className="text-sm font-semibold text-orange-400 mb-2">Mantenimientos</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {['mantenimiento-inicio', 'mantenimiento-fin'].map((t, i) => (
                      <button
                        key={t}
                        className={`p-2 rounded-lg text-xs font-medium transition-all ${tipo === t ? 'bg-gradient-to-br from-orange-600 to-orange-800 text-white shadow-lg' : 'bg-gray-800/60 text-orange-300 border border-orange-500/30 hover:bg-gray-700/70'}`}
                        onClick={() => seleccionarTipo(t)}
                      >
                        {i === 0 ? '⚠️' : '✅'}<br/>{i === 0 ? 'Inicio' : 'Fin'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border border-red-500/20 rounded-lg p-3 bg-black/40">
                  <h3 className="text-sm font-semibold text-red-400 mb-2">Incidentes</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {['incidente-inicio', 'incidente-avance', 'incidente-fin'].map((t, i) => (
                      <button
                        key={t}
                        className={`p-2 rounded-lg text-xs font-medium transition-all ${tipo === t ? 'bg-gradient-to-br from-red-600 to-red-800 text-white shadow-lg' : 'bg-gray-800/60 text-red-300 border border-red-500/30 hover:bg-gray-700/70'}`}
                        onClick={() => seleccionarTipo(t)}
                      >
                        {i === 0 ? '🟡' : i === 1 ? '🔁' : '🟢'}<br/>{i === 0 ? 'Inicio' : i === 1 ? 'Avance' : 'Fin'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Panel central y derecho */}
          <div className="lg:col-span-2 space-y-6">
            <div className={card}>
              <h2 className="text-xl font-bold text-blue-300 mb-4">Configuración del Mensaje</h2>

              {modoBLU && tipo.startsWith('evento-') && (
                <div className={`p-4 rounded-lg mb-4 border-2 ${
                  tipoBLU === 'bian' ? 'bg-orange-900/20 border-orange-500/50' :
                  tipoBLU === 'infraestructura' ? 'bg-purple-900/20 border-purple-500/50' :
                  'bg-blue-900/20 border-blue-500/50'
                }`}>
                  <p className="text-xs font-semibold text-blue-300 mb-1">Escalamiento configurado a:</p>
                  <p className="text-sm font-bold text-blue-100">
                    {tipoBLU === 'bian' 
                      ? 'Miguel Angel López Garavito'
                      : tipoBLU === 'infraestructura'
                      ? 'Infraestructura Cloud'
                      : 'Paul Chamorro / David Albuja'}
                  </p>
                  {tipoBLU === 'bian' && (
                    <p className="text-xs text-blue-400 mt-1">Email: malopez@dinersclub.com.ec</p>
                  )}
                </div>
              )}

              {(tipo.startsWith('evento-') || tipo.startsWith('incidente-')) && (
                <div className="space-y-4">
                  <div>
                    <label className={label}>
                      Descripción {modoBLU && <span className="text-xs ml-2 text-blue-400/70 font-normal">(Formato: Alerta [namespace/cluster])</span>}
                    </label>
                    <input 
                      className={input}
                      type="text" 
                      name="descripcion"
                      placeholder={modoBLU ? "Alerta CLUSTER_EKS_KB" : "Descripción del incidente"}
                      value={formData.descripcion}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label className={label}>Impacto</label>
                    <textarea 
                      className={input + " h-24 resize-y"}
                      name="impacto"
                      placeholder="Impacto servicio/usuarios"
                      value={formData.impacto}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label className={label}>Escalado a (opcional)</label>
                    {ultimoEscalado && (
                      <div className="text-xs text-amber-400 mb-2 border border-amber-500/50 bg-amber-900/20 p-2 rounded-lg">
                        ⚠️ Último escalamiento: {ultimoEscalado}
                      </div>
                    )}
                    <input
                      type="text"
                      name="escaladoA"
                      placeholder="Nombre de la persona o equipo..."
                      value={formData.escaladoA}
                      onChange={(e) => setFormData(prev => ({ ...prev, escaladoA: e.target.value.toUpperCase() }))}
                      className={input}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-blue-400/70 italic">El texto se convertirá a MAYÚSCULAS</p>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoLimpiarEscalado}
                          onChange={(e) => setAutoLimpiarEscalado(e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-black/40 border-blue-500/50 rounded"
                        />
                        <span className="text-xs text-blue-400">Auto-limpiar</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
              
              {tipo.startsWith('mantenimiento-') && (
                <div className="space-y-4">
                  <div>
                    <label className={label}>Motivo</label>
                    <input 
                      className={input}
                      type="text" 
                      name="motivo"
                      placeholder="Descripción del mantenimiento"
                      value={formData.motivo}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className={label}>Impacto</label>
                    <textarea 
                      className={input + " h-24 resize-y"}
                      name="impactoMant"
                      placeholder="Impacto servicio/usuarios/clientes"
                      value={formData.impactoMant}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className={label}>Ejecutor</label>
                    <input 
                      className={input}
                      type="text" 
                      name="ejecutor"
                      placeholder="Proveedor o área interna"
                      value={formData.ejecutor}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}
              
              {/* Opciones avanzadas */}
              <div className="mt-6 space-y-3 border-t border-blue-500/20 pt-4">
                <h3 className="text-sm font-semibold text-blue-300 mb-3">Opciones Avanzadas</h3>
                
                {(tipo === 'evento-inicio' || tipo === 'incidente-inicio') && (
                  <label className="flex items-center space-x-2 cursor-pointer p-3 bg-black/40 rounded-lg border border-blue-500/20 hover:bg-black/60 transition-all">
                    <input
                      type="checkbox"
                      checked={multiplesServicios}
                      onChange={(e) => setMultiplesServicios(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-black/40 border-blue-500/50 rounded"
                    />
                    <span className="text-sm font-medium text-blue-300">Múltiples servicios alertados</span>
                  </label>
                )}
                
                {(tipo === 'evento-inicio' || tipo === 'evento-seguimiento') && (
                  <label className="flex items-center space-x-2 cursor-pointer p-3 bg-black/40 rounded-lg border border-blue-500/20 hover:bg-black/60 transition-all">
                    <input
                      type="checkbox"
                      checked={multiplesEncolamientos}
                      onChange={(e) => setMultiplesEncolamientos(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-black/40 border-blue-500/50 rounded"
                    />
                    <span className="text-sm font-medium text-blue-300">Encolamiento múltiple</span>
                  </label>
                )}
                
                {tipo.endsWith('-fin') && (
                  <>
                    {(tipo === 'evento-fin' || tipo === 'incidente-fin') && (
                      <label className="flex items-center space-x-2 cursor-pointer p-3 bg-black/40 rounded-lg border border-blue-500/20 hover:bg-black/60 transition-all">
                        <input
                          type="checkbox"
                          checked={multiplesServicios}
                          onChange={(e) => setMultiplesServicios(e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-black/40 border-blue-500/50 rounded"
                        />
                        <span className="text-sm font-medium text-blue-300">Múltiples servicios alertados</span>
                      </label>
                    )}
                    
                    <label className="flex items-center space-x-2 cursor-pointer p-3 bg-black/40 rounded-lg border border-blue-500/20 hover:bg-black/60 transition-all">
                      <input
                        type="checkbox"
                        checked={multiplesAlertamientos}
                        onChange={(e) => setMultiplesAlertamientos(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-black/40 border-blue-500/50 rounded"
                      />
                      <span className="text-sm font-medium text-blue-300">Períodos de alertamiento múltiples</span>
                    </label>

                    {tipo.startsWith('evento-') && (
                      <label className="flex items-center space-x-2 cursor-pointer p-3 bg-black/40 rounded-lg border border-blue-500/20 hover:bg-black/60 transition-all">
                        <input
                          type="checkbox"
                          checked={multiplesEncolamientos}
                          onChange={(e) => setMultiplesEncolamientos(e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-black/40 border-blue-500/50 rounded"
                        />
                        <span className="text-sm font-medium text-blue-300">Encolamiento múltiple</span>
                      </label>
                    )}
                  </>
                )}
              </div>

              {/* Secciones expandibles según opciones */}
              {multiplesServicios && (tipo === 'evento-inicio' || tipo === 'incidente-inicio' || tipo === 'evento-fin' || tipo === 'incidente-fin') && (
                <div className="mt-4 space-y-3 border border-blue-500/30 rounded-lg p-4 bg-black/20">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-blue-300">Servicios Alertados</h3>
                    <button onClick={agregarServicioAlertado} className="text-sm bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-3 py-1.5 rounded-lg font-medium shadow-lg">
                      <Plus className="w-3 h-3 inline mr-1" />Agregar
                    </button>
                  </div>
                  {serviciosAlertados.map((servicio, index) => (
                    <div key={index} className="bg-black/40 rounded-lg p-4 border border-blue-500/30">
                      <div className="flex justify-between mb-3">
                        <span className="text-sm font-medium text-blue-300">Servicio {index + 1}</span>
                        {serviciosAlertados.length > 1 && (
                          <button onClick={() => eliminarServicioAlertado(index)} className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          type="text" 
                          placeholder="Nombre del servicio"
                          value={servicio.nombre}
                          onChange={(e) => actualizarServicioAlertado(index, 'nombre', e.target.value)}
                          className="col-span-2 p-2 bg-black/40 border border-blue-500/30 rounded-lg text-blue-100 text-sm"
                        />
                        <input type="date" value={servicio.fechaInicio} onChange={(e) => actualizarServicioAlertado(index, 'fechaInicio', e.target.value)} className="p-2 bg-black/40 border border-blue-500/30 rounded-lg text-blue-100 text-sm" />
                        <input type="time" step="1" value={servicio.horaInicio} onChange={(e) => actualizarServicioAlertado(index, 'horaInicio', e.target.value)} className="p-2 bg-black/40 border border-blue-500/30 rounded-lg text-blue-100 text-sm" />
                        {tipo.endsWith('-fin') && (
                          <>
                            <input type="date" value={servicio.fechaFin} onChange={(e) => actualizarServicioAlertado(index, 'fechaFin', e.target.value)} className="p-2 bg-black/40 border border-blue-500/30 rounded-lg text-blue-100 text-sm" />
                            <input type="time" step="1" value={servicio.horaFin} onChange={(e) => actualizarServicioAlertado(index, 'horaFin', e.target.value)} className="p-2 bg-black/40 border border-blue-500/30 rounded-lg text-blue-100 text-sm" />
                            <div className="col-span-2 text-center text-blue-200 text-sm font-medium bg-blue-900/30 p-2 rounded-lg">
                              Duración: {servicio.duracion}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {multiplesEncolamientos && (
                <div className="mt-4 space-y-3 border border-blue-500/30 rounded-lg p-4 bg-black/20">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-semibold text-blue-300">Servicios Encolados</h3>
                    <button onClick={agregarServicioEncolamiento} className="text-sm bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-3 py-1.5 rounded-lg font-medium shadow-lg">
                      <Plus className="w-3 h-3 inline mr-1" />Agregar
                    </button>
                  </div>
                  {serviciosEncolamiento.map((servicio, index) => (
                    <div key={index} className="bg-black/40 rounded-lg p-4 border border-blue-500/30">
                      <div className="flex justify-between mb-3">
                        <span className="text-sm font-medium text-blue-300">Servicio {index + 1}</span>
                        {serviciosEncolamiento.length > 1 && (
                          <button onClick={() => eliminarServicioEncolamiento(index)} className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <select value={servicio.tipo} onChange={(e) => actualizarServicioEncolamiento(index, 'tipo', e.target.value)} className="w-full p-2 bg-black/40 border border-blue-500/30 rounded-lg text-blue-100 text-sm">
                          {OPCIONES_ENCOLAMIENTO.map(opcion => (<option key={opcion} value={opcion}>{opcion}</option>))}
                          <option value="Otro">Otro (especificar)</option>
                        </select>
                        {servicio.tipo === 'Otro' && (<input type="text" placeholder="Especifica" value={servicio.tipoCustom} onChange={(e) => actualizarServicioEncolamiento(index, 'tipoCustom', e.target.value)} className="w-full p-2 bg-black/40 border border-blue-500/30 rounded-lg text-blue-100 text-sm" />)}
                        <input type="number" placeholder="Cantidad encolada" value={servicio.encolados} onChange={(e) => actualizarServicioEncolamiento(index, 'encolados', e.target.value)} className="w-full p-2 bg-black/40 border border-blue-500/30 rounded-lg text-blue-100 text-sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {multiplesAlertamientos && tipo.endsWith('-fin') && !multiplesServicios && !multiplesEncolamientos && (
                <div className="mt-4 space-y-3 border border-blue-500/30 rounded-lg p-4 bg-black/20">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-semibold text-blue-300">Períodos de Alertamiento</h3>
                    <button onClick={agregarPeriodo} className="text-sm bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-3 py-1.5 rounded-lg font-medium shadow-lg">
                      <Plus className="w-3 h-3 inline mr-1" />Agregar
                    </button>
                  </div>
                  {periodosAlertamiento.map((periodo, index) => (
                    <div key={index} className="bg-black/40 rounded-lg p-4 border border-blue-500/30">
                      <div className="flex justify-between mb-3">
                        <span className="text-sm font-medium text-blue-300">Período {index + 1}</span>
                        {periodosAlertamiento.length > 1 && (
                          <button onClick={() => eliminarPeriodo(index)} className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input type="date" value={periodo.fechaInicio} onChange={(e) => actualizarPeriodo(index, 'fechaInicio', e.target.value)} className="p-2 bg-black/40 border border-blue-500/30 rounded-lg text-blue-100 text-sm" />
                        <input type="time" step="1" value={periodo.horaInicio} onChange={(e) => actualizarPeriodo(index, 'horaInicio', e.target.value)} className="p-2 bg-black/40 border border-blue-500/30 rounded-lg text-blue-100 text-sm" />
                        <input type="date" value={periodo.fechaFin} onChange={(e) => actualizarPeriodo(index, 'fechaFin', e.target.value)} className="p-2 bg-black/40 border border-blue-500/30 rounded-lg text-blue-100 text-sm" />
                        <input type="time" step="1" value={periodo.horaFin} onChange={(e) => actualizarPeriodo(index, 'horaFin', e.target.value)} className="p-2 bg-black/40 border border-blue-500/30 rounded-lg text-blue-100 text-sm" />
                        <div className="col-span-2 text-center text-blue-200 text-sm font-medium bg-blue-900/30 p-2 rounded-lg">Duración: {periodo.duracion}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Fechas para inicio */}
              {tipo.endsWith('-inicio') && !multiplesServicios && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className={label}>Fecha de Inicio</label>
                    <input className={input} type="date" name="fechaInicio" value={formData.fechaInicio} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className={label}>Hora de Inicio</label>
                    <input className={input} type="time" step="1" name="horaInicio" value={formData.horaInicio} onChange={handleInputChange} />
                  </div>
                </div>
              )}

              {/* Acciones */}
              {tipo === 'evento-seguimiento' && (
                <div className="mt-4">
                  <label className={label}>Acciones</label>
                  <textarea 
                    className={input + " h-32 resize-y"}
                    placeholder="Acción %% Responsable (opcional)"
                    name="acciones"
                    value={formData.acciones}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              
              {tipo === 'incidente-avance' && (
                <div className="space-y-4 mt-4">
                  <div>
                    <label className={label}>Acciones en Curso</label>
                    <textarea 
                      className={input + " h-24 resize-y"}
                      placeholder="Acción %% Responsable"
                      name="accionesEnCurso"
                      value={formData.accionesEnCurso}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className={label}>Acciones Ejecutadas</label>
                    <textarea 
                      className={input + " h-24 resize-y"}
                      placeholder="Acción %% Responsable"
                      name="accionesEjecutadas"
                      value={formData.accionesEjecutadas}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}
              
              {/* Fechas de fin */}
              {tipo.endsWith('-fin') && !multiplesServicios && !multiplesEncolamientos && !multiplesAlertamientos && (
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={label}>Fecha de Inicio</label>
                      <input className={input} type="date" name="fechaInicioFin" value={formData.fechaInicioFin} onChange={handleInputChange} />
                    </div>
                    <div>
                      <label className={label}>Hora de Inicio</label>
                      <input className={input} type="time" step="1" name="horaInicioFin" value={formData.horaInicioFin} onChange={handleInputChange} />
                    </div>
                    <div>
                      <label className={label}>Fecha de Fin</label>
                      <input className={input} type="date" name="fechaFin" value={formData.fechaFin} onChange={handleInputChange} />
                    </div>
                    <div>
                      <label className={label}>Hora de Fin</label>
                      <input className={input} type="time" step="1" name="horaFin" value={formData.horaFin} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-lg text-center">
                    <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">{formData.duracionCalculada}</span>
                  </div>
                </div>
              )}
              
              {(tipo === 'evento-fin' || tipo === 'incidente-fin') && (
                <div className="mt-4">
                  <label className={label}>Acciones Ejecutadas</label>
                  <textarea 
                    className={input + " h-32 resize-y"}
                    placeholder="Acción %% Responsable"
                    name={tipo === 'evento-fin' ? 'acciones' : 'accionesEjecutadas'}
                    value={tipo === 'evento-fin' ? formData.acciones : formData.accionesEjecutadas}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              
              {/* Nota */}
              <div className="mt-4">
                <label className={label}>Nota Adicional (opcional)</label>
                {tipo === 'evento-fin' && (
                  <div className="mb-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <p className="text-xs text-blue-300 font-semibold mb-1">📝 Instrucciones:</p>
                    <p className="text-xs text-blue-400/80">
                      Indica <span className="font-semibold text-blue-300">la acción realizada para recuperar el servicio</span>. 
                      Si se recuperó automáticamente, también debe indicarse.
                    </p>
                  </div>
                )}
                <textarea 
                  className={input + " h-20 resize-y"}
                  placeholder="Observaciones adicionales"
                  name="nota"
                  value={formData.nota}
                  onChange={handleInputChange}
                />
              </div>
              
              <button 
                className={`w-full mt-6 ${btnPrimary}`}
                onClick={generarMensaje}
              >
                <Zap className="w-5 h-5 inline mr-2" />
                Generar Mensaje
              </button>
            </div>
            
            {/* Resultado */}
            <div className={card}>
              <h2 className="text-xl font-bold text-blue-300 mb-4">Mensaje Generado</h2>
              <div className="bg-black/60 p-4 rounded-lg min-h-[150px] border border-blue-500/30">
                <pre className="whitespace-pre-wrap text-blue-100 text-sm font-mono">{resultado || 'El mensaje generado aparecerá aquí...'}</pre>
              </div>
              
              {mostrarAlerta && (
                <div className="mt-4 p-3 rounded-lg bg-green-900/30 border border-green-500/50">
                  <p className="text-green-300 text-sm font-medium">✓ {alertaMensaje}</p>
                </div>
              )}
              
              <div className="flex gap-4 mt-4">
                <button className={btnPrimary + " flex-1"} onClick={copiar}>
                  <Copy className="w-4 h-4 inline mr-2" />
                  Copiar
                </button>
                <button className={btnSecondary + " flex-1"} onClick={limpiarCampos}>
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modales */}
        {mostrarActualizacion && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900/95 backdrop-blur-xl border border-blue-500/30 rounded-xl p-6 max-w-md mx-4 shadow-2xl">
              <h3 className="text-lg font-bold text-blue-300 mb-2">Sincronización Requerida</h3>
              <p className="text-blue-400/80 text-sm mb-4">
                Tiempo: {calcularTiempoAbierto().horas}h {calcularTiempoAbierto().minutos}m
              </p>
              <div className="flex gap-3">
                <button onClick={actualizarFechasAhora} className={btnPrimary + " flex-1"}>Sincronizar</button>
                <button onClick={() => setMostrarActualizacion(false)} className={btnSecondary + " flex-1"}>Más tarde</button>
              </div>
              <button onClick={() => {setNoPreguntar(true); setMostrarActualizacion(false);}} className="w-full mt-2 text-xs text-blue-400/70 hover:text-blue-300">
                No volver a preguntar
              </button>
            </div>
          </div>
        )}

        {mostrarConfirmacionDuracion && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900/95 backdrop-blur-xl border border-amber-500/50 rounded-xl p-6 max-w-md mx-4 shadow-2xl">
              <h3 className="text-xl font-bold text-amber-400 mb-4">Verificación de Duración</h3>
              <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4 mb-4">
                <p className="text-blue-200 mb-2 font-medium">
                  Duración: <span className="font-bold text-amber-400 text-xl">
                    {multiplesAlertamientos && periodosAlertamiento.length > 0 ? calcularDuracionTotal() : formData.duracionCalculada}
                  </span>
                </p>
                <p className="text-blue-300/80 text-sm">
                  Excede el umbral de 4 horas. ¿Continuar?
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setMostrarConfirmacionDuracion(false);
                    generarMensajeInterno();
                  }} 
                  className={btnPrimary + " flex-1"}
                >
                  Confirmar
                </button>
                <button 
                  onClick={() => setMostrarConfirmacionDuracion(false)} 
                  className={btnWarning + " flex-1"}
                >
                  Revisar
                </button>
              </div>
            </div>
          </div>
        )}

        <footer className="text-center py-6 mt-8 text-blue-400/50 text-xs border-t border-blue-500/20">
          <p className="font-medium text-blue-300/70">Centro de Comando - Diners Club del Ecuador</p>
          <p className="mt-2 text-blue-500/50">Versión 6.1 - Desarrollado por: Luis Alberto Herrera Lara</p>
        </footer>
      </div>
    </div>
  );
}
