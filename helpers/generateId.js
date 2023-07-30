const generarId = () => {
    const random = Math.random().toString(32).slice(2);
    const fecha = Date.now().toString(32);

    return random + fecha;
}

export default generarId;
