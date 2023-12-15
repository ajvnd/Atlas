namespace Atlas.Models;

public class BaseListViewModel
{
    public string Text { get; set; }
    public int[] ProvinceIds { get; set; }
    public int[] DomainIds { get; set; }
    public bool IsEnabled { get; set; } = true;
}