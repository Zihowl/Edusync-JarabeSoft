import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExcelService } from './services/excel.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Recomendado: Proteger ruta

@Controller('academic')
export class AcademicController 
{
    constructor(private readonly excelService: ExcelService) 
    {}

    @Post('upload-schedule')
    // @UseGuards(JwtAuthGuard) // Descomentar para producción
    @UseInterceptors(FileInterceptor('file'))
    async UploadSchedule(@UploadedFile() file: Express.Multer.File) 
    {
        this.ValidateUploadFile(file);

        const result = await this.excelService.ProcessScheduleFile(file.buffer);

        return {
            message: 'Procesamiento completado',
            details: result,
        };
    }

    private ValidateUploadFile(file: Express.Multer.File) 
    {
        if (!file) 
        {
            throw new BadRequestException('No se subió ningún archivo');
        }

        // Validar extensión
        if (!file.originalname.match(/\.(xlsx|xls)$/)) 
        {
            throw new BadRequestException('Solo se permiten archivos Excel (.xlsx)');
        }
    }
}
