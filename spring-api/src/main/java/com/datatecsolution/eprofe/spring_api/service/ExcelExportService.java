package com.datatecsolution.eprofe.spring_api.service;

import com.datatecsolution.eprofe.spring_api.model.*;
import com.datatecsolution.eprofe.spring_api.repository.*;
import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Year;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Servicio para rellenar archivos Excel originales del SACE con las notas
 * ingresadas por el docente. Replica el flujo de Laravel:
 * 1. Abre el Excel original guardado en disco
 * 2. Escribe las notas de los acumulativos en las columnas correspondientes
 * 3. Retorna los bytes del archivo rellenado
 */
@Service
public class ExcelExportService {

    @Autowired
    private ExcelImportService excelImportService;

    @Autowired
    private AcumulativoRepository acumulativoRepository;

    @Autowired
    private NotaAcumulativoRepository notaAcumulativoRepository;

    @Autowired
    private MatriculaRepository matriculaRepository;

    @Autowired
    private AlumnoRepository alumnoRepository;

    // Constantes del layout del Excel SACE (mismas que ExcelImportService)
    private static final int ROW_DATA_START = 7; // fila 8 (0-indexed)
    private static final int COL_RNE = 1;        // columna B
    private static final int COL_NOTAS_START = 3; // columna D en adelante para notas

    /**
     * Abre el Excel original, lo rellena con las notas del parcial indicado
     * y retorna los bytes del archivo rellenado.
     *
     * @param userSace     Identificador SACE del docente
     * @param seccionId    ID de la seccion
     * @param asignaturaId ID de la asignatura
     * @param parcial      Numero de parcial (1-4)
     * @return bytes del archivo Excel rellenado
     */
    @Transactional(readOnly = true)
    public byte[] fillExcelWithGrades(String userSace, Long seccionId, Long asignaturaId, Integer parcial)
            throws IOException {

        // 1. Localizar el archivo Excel original
        Path excelPath = excelImportService.getStoredExcelPath(userSace, seccionId, asignaturaId);
        if (!Files.exists(excelPath)) {
            throw new IOException("Archivo Excel original no encontrado: " + excelPath);
        }

        // 2. Abrir el archivo con Apache POI
        Workbook workbook;
        try (FileInputStream fis = new FileInputStream(excelPath.toFile())) {
            workbook = WorkbookFactory.create(fis);
        }

        Sheet sheet = workbook.getSheetAt(0);

        // 3. Obtener los acumulativos para esta seccion/asignatura/parcial
        List<Acumulativo> acumulativos = acumulativoRepository
                .findByAsignaturaIdAndSeccionId(asignaturaId, seccionId)
                .stream()
                .filter(a -> parcial.equals(a.getParcial()))
                .sorted(Comparator.comparing(Acumulativo::getFecha,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());

        if (acumulativos.isEmpty()) {
            workbook.close();
            throw new IOException("No se encontraron acumulativos para seccion=" + seccionId
                    + ", asignatura=" + asignaturaId + ", parcial=" + parcial);
        }

        // 4. Construir mapa de notas: alumnoRne -> [nota1, nota2, ...]
        // El orden de las notas corresponde al orden de los acumulativos
        Map<String, Double[]> notasPorAlumno = buildGradesMap(acumulativos);

        // 5. Escribir encabezados de acumulativos (fila 7, columnas D+)
        Row headerRow = sheet.getRow(ROW_DATA_START - 1);
        if (headerRow == null) {
            headerRow = sheet.createRow(ROW_DATA_START - 1);
        }
        for (int i = 0; i < acumulativos.size(); i++) {
            Cell cell = headerRow.createCell(COL_NOTAS_START + i);
            cell.setCellValue(acumulativos.get(i).getDescripcion());
        }

        // 6. Recorrer las filas de alumnos y escribir las notas
        Iterator<Row> rowIterator = sheet.iterator();
        while (rowIterator.hasNext()) {
            Row row = rowIterator.next();
            if (row.getRowNum() < ROW_DATA_START) continue;

            Cell rneCell = row.getCell(COL_RNE);
            if (rneCell == null) continue;

            String rne = getCellValueAsString(rneCell);
            if (rne.isEmpty()) continue;

            Double[] notas = notasPorAlumno.get(rne);
            if (notas == null) continue;

            // Escribir cada nota en la columna correspondiente
            for (int i = 0; i < notas.length; i++) {
                Cell notaCell = row.createCell(COL_NOTAS_START + i);
                if (notas[i] != null) {
                    notaCell.setCellValue(notas[i]);
                }
            }
        }

        // 7. Escribir a bytes y retornar
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();

        return baos.toByteArray();
    }

    /**
     * Construye un mapa de RNE -> notas[] para cada alumno,
     * donde el indice corresponde al orden de los acumulativos.
     */
    private Map<String, Double[]> buildGradesMap(List<Acumulativo> acumulativos) {
        Map<String, Double[]> notasPorAlumno = new LinkedHashMap<>();
        int numAcumulativos = acumulativos.size();

        for (int i = 0; i < numAcumulativos; i++) {
            Acumulativo acumulativo = acumulativos.get(i);
            List<NotaAcumulativo> notas = notaAcumulativoRepository.findByAcumulativo(acumulativo);

            for (NotaAcumulativo nota : notas) {
                String rne = nota.getAlumno().getRne();
                notasPorAlumno.computeIfAbsent(rne, k -> new Double[numAcumulativos]);
                notasPorAlumno.get(rne)[i] = nota.getNota();
            }
        }

        return notasPorAlumno;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            default -> "";
        };
    }
}
