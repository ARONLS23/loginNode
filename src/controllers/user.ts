import { Request, Response, Router } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/user";
import  jwt from "jsonwebtoken";

export const newUser = async (req: Request, res: Response) => {

    const { username, password } = req.body;

    //Validamos si el usuario existe en la BD

    const user =  await User.findOne ({where: {username: username}});
    
    if(user){
        return res.status(400).json({
            msg: `Ya existe un usuario con el nombre ${username} registrado en la BD`
        })
    }
    

    const hashedPassword = await bcrypt.hash(password, 10);
    //console.log(hashedPassword);

    try {

        //Guardado exitosamente

        await User.create({
            username: username,
            password: hashedPassword
        })
        
        res.json({
            msg: `Usuario ${username} creado exitosamente!`
        })
        
    } catch (error) {

        res.status(400).json({
            msg: 'Upps ocurrio un error',
            error
        })
        
    }

}

export const loginUser = async (req: Request, res: Response) => {

    const { username, password } = req.body;
    
    //Validamos si el usuario existe en la BD

    const user: any =  await User.findOne ({where: {username: username}});
    
    if(!user){
        return res.status(400).json({
            msg: `No existe un usuario con el nombre ${username} en la base de datos`
        })
    }

    //Validamos password 

    const passwordValied = await bcrypt.compare(password, user.password);
   if(!passwordValied){
    return res.status(400).json({
        msg: `Password incorrecta`
    })
   }

    //Generamos token

    const token = jwt.sign({
        username: username
    }, process.env.SECRET_KEY || 'aron123')

    res.json({
        token
    });

}