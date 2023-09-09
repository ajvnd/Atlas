using System.Globalization;

namespace Atlas.Extensions;

public static class StringExtensions
{
    public static DateTime? PersianDateToGregorian(this string value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return null;
        }

        string[] d = value.Split('/');
        return new DateTime(int.Parse(d[0]), int.Parse(d[1]), int.Parse(d[2]),
            new System.Globalization.PersianCalendar());
    }

    public static string PersianToEnglishDigit(this string str)
    {
        return str.Replace("۰", "0")
            .Replace("۱", "1")
            .Replace("۲", "2")
            .Replace("۳", "3")
            .Replace("۴", "4")
            .Replace("۵", "5")
            .Replace("۶", "6")
            .Replace("۷", "7")
            .Replace("۸", "8")
            .Replace("۹", "9");
    }

    public static string GregorianDateToPersianDate(this DateTime? dt)
    {
        return dt == null ? "" : dt.Value.ToString(new CultureInfo("fa-IR"));
    }
}