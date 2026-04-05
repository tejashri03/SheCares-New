"""Compatibility entrypoint.

Keeps the existing `python new_backend.py` command working,
but serves the MySQL-backed application.
"""

from mysql_backend import app


if __name__ == "__main__":
    print("🚀 Starting SheCares Backend via new_backend.py")
    print("📊 Database: MySQL (shecares)")
    print("✅ Entrypoint mapped to mysql_backend.py")
    print("=" * 60)
    app.run(host="127.0.0.1", port=5000, debug=True)
