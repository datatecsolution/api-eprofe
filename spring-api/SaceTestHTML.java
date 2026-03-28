import java.io.IOException;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class SaceTestHTML {
    public static void main(String[] args) throws IOException {
        String html = "<table class=\"table table-bordered table-condensed\"><tbody>"
                + "<tr>"
                + "<td>DOCEAVO GRADO</td>"
                + "<td>JORNADA MATUTINA</td>"
                + "<td>2</td>"
                + "<td>(OFICIAL) - PROGRAMACIÓN II</td>"
                + "<td style=\"text-align:center; vertical-align: middle; width: 1%;\">"
                + "<button type=\"submit\" class=\"descargar btn btn-info btn-small\" data-cs=\"19832274\">"
                + "<i class=\"icon-download-alt icon-white\"></i>"
                + "</button>"
                + "</td>"
                + "</tr>"
                + "</tbody></table>";

        Document doc = Jsoup.parse(html);
        Elements buttons = doc.select("button.descargar[data-cs]");
        System.out.println("Found " + buttons.size() + " buttons.");
        for (Element btn : buttons) {
            String id = btn.attr("data-cs");
            System.out.println("ID: " + id);

            // Extract the Asignatura name from the previous columns
            Element row = btn.parent().parent();
            Elements cols = row.select("td");
            if (cols.size() >= 4) {
                String className = cols.get(cols.size() - 2).text();
                String courseName = cols.get(0).text();
                System.out.println("Subject: " + className);
                System.out.println("Course: " + courseName);
            }
        }
    }
}
