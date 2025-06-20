package com.sep.sepdrivebackend.repository;

import com.sep.sepdrivebackend.entities.History;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface HistoryRepository extends JpaRepository<History, Long> {
    /**
     * Liefert die Summe aller gefahrenen Kilometer ("drivenDistance")
     * für den angegebenen Benutzer. Weil ein Benutzer entweder Fahrer oder Kunde ist, ist das OR eine
     * einfache Lösung, weil die ID immer nur in der Fahrer- oder Kundenspalte vorkommen kann.
     *
     * @param userId ID des Benutzers
     * @return Gesamtkilometer (0.0, wenn keine Fahrten vorhanden)
     */
    @Query("""
           SELECT COALESCE(SUM(h.drivenDistance), 0)
           FROM   History h
           WHERE  h.driver.id   = :userId
              OR  h.customer.id = :userId
           """)
    double getTotalDrivenDistanceByUserId(@Param("userId") Long userId);
}
