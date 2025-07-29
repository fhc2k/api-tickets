const registerUser = asyncHandler(async (req, res) => {
    const { name, department, email, password } = req.body;

    const cleanedName = name?.trim();
    const cleanedEmail = email?.trim().toLowerCase();
    const cleanedPassword = password?.trim();
    const cleanedDepartment = department?.trim();

    const reservedWords = [
        "admin",
        "root",
        "support",
        "system",
        "moderator",
        "staff",
        "backend",
        "dev",
        "test",
    ];

    const emailRegex = /^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/;

    if (
        !cleanedName ||
        !cleanedDepartment ||
        !cleanedEmail ||
        !cleanedPassword
    ) {
        res.status(400);
        throw new Error("Por favor, complete todos los campos requeridos");
    }

    if (!emailRegex.test(cleanedEmail)) {
        res.status(400);
        throw new Error("El correo ingresado no es valido.");
    }

    const emailName = cleanedEmail.split("@")[0];

    if (reservedWords.some((word) => emailName.includes(word))) {
        res.status(400);
        throw new Error(
            "El correo contiene palabras reservadas no permitidas."
        );
    }

    const existingUser = await User.findOne({
        $or: [{ email: cleanedEmail }, { department: cleanedDepartment }],
    });

    if (existingUser) {
        const isEmailTaken = existingUser.email === cleanedEmail;
        const isDepartmentTaken = existingUser.department === cleanedDepartment;

        if (isEmailTaken && isDepartmentTaken) {
            res.status(400);
            throw new Error(
                "Ya existe una cuenta asociada a este correo y departamento."
            );
        } else if (isEmailTaken) {
            res.status(400);
            throw new Error("Ya existe una cuenta asociada a este correo.");
        } else if (isDepartmentTaken) {
            res.status(400);
            throw new Error(
                `Ya existe un usuario registrado en el departamento "${cleanedDepartment}". Solo se permite un usuario por departamento.`
            );
        }
    }

    if (cleanedPassword.trim().length < 6) {
        res.status(400);
        throw new Error("La contraseña debe tener al menos 6 caracteres.");
    }

    const createUser = await User.create({
        name: cleanedName,
        department: cleanedDepartment,
        email: cleanedEmail,
        password: cleanedPassword,
    });

    if (!createUser) {
        res.status(400);
        throw new Error("Error al crear usuario, intentalo mas tarde.");
    }

    const user = {
        _id: createUser._id,
        name: createUser.name,
        email: createUser.email,
        department: createUser.department,
        username: createUser.username,
        role: createUser.role,
        status: createUser.status,
        token: generateToken(createUser._id),
    };

    sendWelcomeEmail(user);

    res.status(201).json({
        message: "Usuario registrado exitosamente.",
        user,
    });
});



const updateUserRole = asyncHandler(async (req, res) => {
    const { id: userId } = req.params;
    const { role: userRole } = req.body;
    const cleanedUserRole = userRole?.trim();

    if (!cleanedUserRole) {
        res.status(400);
        throw new Error("El valor recibido no es válido.");
    }

    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error("Usuario no encontrado.");
    }

    if (user.role !== "pending_user") {
        res.status(400);
        throw new Error("El usuario ya tiene un rol asignado.");
    }

    if (cleanedUserRole === "admin") {
        res.status(403);
        throw new Error(
            "No se permite asignar el rol de administrador a través de la API."
        );
    }

    if (!["technician", "guest"].includes(cleanedUserRole)) {
        res.status(400);
        throw new Error(
            "Rol de usuario inválido. Solo se permite 'technician' o 'guest'."
        );
    }

    user.role = cleanedUserRole;
    const updatedUser = await user.save();

    sendRoleChangeEmail({
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
    });

    res.json({
        message: "Se actualizo el rol del usuario de manera existosa.",
        user: {
            _id: updatedUser._id,
            name: updatedUser.name,
            department: updatedUser.department,
            email: updatedUser.email,
            username: updatedUser.username,
            role: updatedUser.role,
            status: updatedUser.status,
            token: generateToken(updatedUser._id),
        },
    });
});


const updateUserStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const cleanedStatus = status?.trim();

    if (!cleanedStatus) {
        res.status(400);
        throw new Error("El valor recibido no es válido.");
    }

    const user = await User.findById(id);

    if (!user) {
        res.status(404);
        throw new Error("Usuario no encontrado.");
    }

    if (user.role === "pending_user") {
        res.status(400);
        throw new Error(
            "No se puede modificar el estado si el usuario no tiene un rol asignado."
        );
    }

    if (!["active", "suspended"].includes(cleanedStatus)) {
        res.status(400);
        throw new Error("Estado no permitido. Usa 'active' o 'suspended'.");
    }

    if (user.status === cleanedStatus) {
        res.status(400);
        throw new Error(`El usuario ya tiene el estado '${cleanedStatus}'.`);
    }

    user.status = cleanedStatus;
    const updatedUser = await user.save();

    sendStatusChangeEmail({
        email: updatedUser.email,
        name: updatedUser.name,
        status: updatedUser.status,
    });

    res.json({
        message: "Se actualizo el estado del usuario de manera existosa.",
        user: {
            _id: updatedUser._id,
            name: updatedUser.name,
            department: updatedUser.department,
            email: updatedUser.email,
            username: updatedUser.username,
            role: updatedUser.role,
            status: updatedUser.status,
            token: generateToken(updatedUser._id),
        },
    });
});