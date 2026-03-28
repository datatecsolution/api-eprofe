package com.datatecsolution.eprofe.spring_api.service;

import com.datatecsolution.eprofe.spring_api.model.*;
import com.datatecsolution.eprofe.spring_api.repository.*;
import com.datatecsolution.eprofe.spring_api.utils.NameParserUtils;
import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.beans.factory.annotation.Value;

import java.io.InputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Year;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.Optional;

@Service
public class ExcelImportService {

    @Value("${eprofe.excel.storage-path:./storage/excel}")
    private String storagePath;

    @Autowired
    private CentroRepository centroRepository;
    @Autowired
    private ModalidadRepository modalidadRepository;
    @Autowired
    private SeccionRepository seccionRepository;
    @Autowired
    private AsignaturaRepository asignaturaRepository;
    @Autowired
    private AlumnoRepository alumnoRepository;
    @Autowired
    private MatriculaRepository matriculaRepository;
    @Autowired
    private DocenteRepository docenteRepository;
    @Autowired
    private AsignaturaSeccionRepository asignaturaSeccionRepository;

    /**
     * Resultado del procesamiento de un archivo Excel.
     */
    public record ImportResult(Long seccionId, Long asignaturaId) {}

    // Cell constants matching ManagerXlsFile.php
    private static final String CELL_CENTRO = "A1";
    private static final String CELL_MODALIDAD = "A2";
    private static final String CELL_GRADO_SECCION = "A3";
    private static final String CELL_JORNADA = "A4";
    private static final String CELL_ASIGNATURA = "A5";
    private static final int ROW_DATA_START = 7; // 0-indexed, so row 8 is index 7
    private static final int COL_RNE = 1; // B
    private static final int COL_NOMBRE = 2; // C

    @Transactional
    public ImportResult processExcelFile(InputStream fileStream, Docente docente) throws Exception {
        Workbook workbook = WorkbookFactory.create(fileStream);
        Sheet sheet = workbook.getSheetAt(0);

        // 1. Process Metadata (Header)
        Centro centro = processCentro(sheet, docente);
        Modalidad modalidad = processModalidad(sheet, centro);
        Seccion seccion = processSeccion(sheet, modalidad, centro);
        Asignatura asignatura = processAsignatura(sheet, seccion, docente);

        // Link Docente-Seccion-Asignatura
        linkDocenteAsignaturaSeccion(docente, seccion, asignatura);

        // 2. Process Students (Rows)
        processAlumnos(sheet, seccion);

        workbook.close();

        return new ImportResult(seccion.getId(), asignatura.getId());
    }

    /**
     * Procesa un archivo Excel y guarda el original en disco como {seccion_id}_{asignatura_id}.xls
     * Replica el comportamiento de ManagerXlsFile en Laravel.
     */
    @Transactional
    public ImportResult processAndStoreExcelFile(byte[] fileBytes, Docente docente) throws Exception {
        // Procesar el archivo para importar datos a BD
        ImportResult result = processExcelFile(
                new java.io.ByteArrayInputStream(fileBytes), docente);

        // Guardar el archivo original en disco
        storeOriginalExcel(fileBytes, docente.getUserSace(), result.seccionId(), result.asignaturaId());

        return result;
    }

    /**
     * Guarda el archivo Excel original en: {storagePath}/{year}/{userSace}/{seccionId}_{asignaturaId}.xls
     */
    private void storeOriginalExcel(byte[] fileBytes, String userSace, Long seccionId, Long asignaturaId)
            throws IOException {
        int year = Year.now().getValue();
        Path dir = Paths.get(storagePath, String.valueOf(year), userSace);
        Files.createDirectories(dir);

        String fileName = seccionId + "_" + asignaturaId + ".xls";
        Path filePath = dir.resolve(fileName);
        Files.write(filePath, fileBytes);
    }

    /**
     * Obtiene la ruta del archivo Excel original guardado.
     */
    public Path getStoredExcelPath(String userSace, Long seccionId, Long asignaturaId) {
        int year = Year.now().getValue();
        return Paths.get(storagePath, String.valueOf(year), userSace,
                seccionId + "_" + asignaturaId + ".xls");
    }

    private Centro processCentro(Sheet sheet, Docente docente) {
        String cellValue = getCellValue(sheet, CELL_CENTRO);
        // Format: "123456 | Nombre Centro"
        String codigoSace = cellValue.split("\\|")[0].trim().replace(" ", "");
        String nombreCentro = cellValue.substring(cellValue.lastIndexOf('|') + 1).trim();

        // Find or create Centro
        Optional<Centro> existingCentro = centroRepository.findByCodigoSace(codigoSace);
        Centro centro;
        if (existingCentro.isPresent()) {
            centro = existingCentro.get();
        } else {
            centro = new Centro();
            centro.setCodigoSace(codigoSace);
            centro.setNombre(nombreCentro);
            centro.setDireccion("NA");
            centro.setTelefono("NA");
            centro = centroRepository.save(centro);

            // Link to Docente
            docente.getCentros().add(centro);
            docenteRepository.save(docente);
        }
        return centro;
    }

    private Modalidad processModalidad(Sheet sheet, Centro centro) {
        String cellValue = getCellValue(sheet, CELL_MODALIDAD);
        // Format: "Modalidad: Bachillerato en Ciencias"
        String nombreModalidad = cellValue.substring(cellValue.lastIndexOf(':') + 1).trim();

        Optional<Modalidad> existingModalidad = modalidadRepository.findByNombreContaining(nombreModalidad);
        Modalidad modalidad;

        if (existingModalidad.isPresent()) {
            modalidad = existingModalidad.get();
        } else {
            modalidad = new Modalidad();
            modalidad.setNombre(nombreModalidad);
            modalidad.setAlias(generateAlias(nombreModalidad));
            modalidad.setObservaciones("NA");
            modalidad = modalidadRepository.save(modalidad);
        }
        return modalidad;
    }

    private Seccion processSeccion(Sheet sheet, Modalidad modalidad, Centro centro) {
        String gradoSeccion = getCellValue(sheet, CELL_GRADO_SECCION);
        String jornada = getCellValue(sheet, CELL_JORNADA);

        // Split "Septimo Grado 1" -> curso="Septimo", seccion="1"
        // Logic from PHP: grado is strtok(value, ' '), seccion is last word <= 2 chars
        String curso = gradoSeccion.split(" ")[0];
        String[] words = gradoSeccion.split(" ");
        String seccionGrupo = "";
        for (String word : words) {
            if (word.length() <= 2) {
                seccionGrupo = word;
            }
        }

        // Logic to find or create Seccion (simplified for now, assumes current period)
        // In real impl, need to fetch active Periodo

        Optional<Seccion> existingSeccion = seccionRepository.findByCursoAndSeccionAndJornadaAndCentro(curso,
                seccionGrupo, jornada, centro);

        if (existingSeccion.isPresent()) {
            return existingSeccion.get();
        }

        Seccion newSeccion = new Seccion();
        newSeccion.setCurso(curso);
        newSeccion.setSeccion(seccionGrupo);
        newSeccion.setJornada(jornada);
        newSeccion.setCentro(centro);
        newSeccion.setModalidad(modalidad);
        // Note: Periodo integration needed here

        return seccionRepository.save(newSeccion);
    }

    private Asignatura processAsignatura(Sheet sheet, Seccion seccion, Docente docente) {
        String nombre = getCellValue(sheet, CELL_ASIGNATURA);

        Optional<Asignatura> existing = asignaturaRepository.findByNombre(nombre);
        Asignatura asignatura;
        if (existing.isPresent()) {
            asignatura = existing.get();
        } else {
            asignatura = new Asignatura();
            asignatura.setNombre(nombre);
            asignatura.setAlias("NA");
            asignatura.setTipo("1");
            asignatura = asignaturaRepository.save(asignatura);
        }
        return asignatura;
    }

    private void linkDocenteAsignaturaSeccion(Docente docente, Seccion seccion, Asignatura asignatura) {
        Optional<AsignaturaSeccion> exists = asignaturaSeccionRepository.findByDocenteAndSeccionAndAsignatura(docente,
                seccion, asignatura);

        if (exists.isEmpty()) {
            AsignaturaSeccion link = new AsignaturaSeccion();
            link.setDocente(docente);
            link.setSeccion(seccion);
            link.setAsignatura(asignatura);
            asignaturaSeccionRepository.save(link);
        }
    }

    private void processAlumnos(Sheet sheet, Seccion seccion) {
        Iterator<Row> rowIterator = sheet.iterator();
        while (rowIterator.hasNext()) {
            Row row = rowIterator.next();
            if (row.getRowNum() < ROW_DATA_START)
                continue;

            Cell rneCell = row.getCell(COL_RNE);
            Cell nombreCell = row.getCell(COL_NOMBRE);

            if (rneCell == null || nombreCell == null)
                continue;

            String rne = getCellValue(rneCell);
            String nombreCompleto = getCellValue(nombreCell);

            if (rne.isEmpty() || nombreCompleto.isEmpty())
                continue;

            // Name Parsing
            NameParserUtils.NameParts parts = NameParserUtils.parseFullName(nombreCompleto);

            // Find or Create Alumno
            Optional<Alumno> existingAlumno = alumnoRepository.findByRne(rne);
            Alumno alumno;
            if (existingAlumno.isPresent()) {
                alumno = existingAlumno.get();
            } else {
                alumno = new Alumno();
                alumno.setRne(rne);
                alumno.setNombre(parts.firstName);
                alumno.setApellido(parts.lastName);
                alumno.setUsername(rne);
                alumno.setPassword(rne); // default password
                alumno.setGenero(1); // default
                alumno.setEmail(rne + "@noemail.com");
                alumno = alumnoRepository.save(alumno);
            }

            // Create Matricula
            // Check if already matriculated in this section
            boolean isMatriculated = matriculaRepository.existsByAlumnoAndSeccion(alumno, seccion);
            if (!isMatriculated) {
                Matricula matricula = new Matricula();
                matricula.setAlumno(alumno);
                matricula.setSeccion(seccion);
                matricula.setYear(java.time.Year.now().getValue());
                matriculaRepository.save(matricula);
            }
        }
    }

    // Helpers
    private String getCellValue(Sheet sheet, String cellRef) {
        // Simple parser for "A1" style refs
        int colIndex = cellRef.charAt(0) - 'A';
        int rowIndex = Integer.parseInt(cellRef.substring(1)) - 1;
        Row row = sheet.getRow(rowIndex);
        if (row != null) {
            return getCellValue(row.getCell(colIndex));
        }
        return "";
    }

    private String getCellValue(Cell cell) {
        if (cell == null)
            return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue()); // Assume integers for IDs/RNE
            default -> "";
        };
    }

    private String generateAlias(String name) {
        return name.length() > 3 ? name.substring(0, 3).toUpperCase() : name.toUpperCase();
    }
}
